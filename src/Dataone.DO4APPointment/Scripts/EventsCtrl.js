'use strict';

DO.event_scope = null;
DO.alertsMgr = null;
DO.eventSvc = null;
DO.votesMgr = null;
DO.httpSvc = null;

DO.app.controller('EventsCtrl', function ($scope, $http, AlertsManager, EventService, VotesManager) {
        DO.hostweburl = decodeURIComponent(DO.helper.getQueryStringParameter("SPHostUrl"));
        DO.appweburl = decodeURIComponent(DO.helper.getQueryStringParameter("SPAppWebUrl"));
        DO.event_scope = $scope;
        DO.alertsMgr = AlertsManager;
        DO.eventSvc = EventService;
        DO.httpSvc = $http;
        DO.votesMgr = VotesManager;

        $scope.copyUrl = function (event, type) {
            var url = $(location).attr('href') + "&eventid=" + event.GUID;
            switch (type) {
                case "modal": $scope.prepareEventUrlModal(url);
                    break;
                case "clip": $scope.copyToClipboard(url);
                    break;
                case "mail": $scope.emailLink(url, "", "Invitation to event " + event.Title);
                    break;
                default:
                    break;
            }
        }

        $scope.prepareEventUrlModal = function (url) {
            try {
                var eventUrlTextarea = $("#copyEventUrlTextarea");
                eventUrlTextarea.val(url);
                eventUrlTextarea.focus();
                eventUrlTextarea.select();
            }
            catch (ex) { }
        }

        $scope.emailLink = function (url, mailto, subject) {
            var body = "Please follow your invitation via the following link:%0D%0A%0D%0A" + escape(url) + "%0D%0A%0D%0A";
            window.location.href = ('mailto:' + mailto + '?subject=' + subject + '&body=' + body);
        }

        $scope.copyToClipboard = function (url) {
            //Only works with IE
            if (window.clipboardData && clipboardData.setData) {
                clipboardData.setData("Text", url);
            }
            else {
                DO.alertsMgr.addAlert("Not supported with your browser.", DO.helper.alert_type.error);
            }
        }

        $scope.doesCurrentBrowserSupportCopyToClipboard = function () {
            //Only works with IE
            if (window.clipboardData && clipboardData.setData) {
                return true;
            }
            return false;
        }

        $scope.openDialog = function (event) {
            VotesManager.processVote(event);
        }
});

DO.prepareURL = function (parameter) {
    var conditionEventID = "";
    var eventid = DO.helper.getQueryStringParameter(parameter);
    if (eventid) {
        conditionEventID = " or GUID eq '" + eventid + "'";
    }
    return conditionEventID;
};

DO.getCurrentUser = function (url) {
    return DO.httpSvc({
        method: 'GET',
        url: DO.appweburl + "/_api/web/currentUser",
        headers: { "Accept": "application/json; odata=verbose" }
    });
}

DO.getEvents = function (getUser, eventCondition) {
    //The condition in the variable eventCondition determines the event shared with a link
    var query = '$filter=Author eq ' + getUser.d.Id + (eventCondition != '' ? eventCondition : '');
    var that = this;
    var user = getUser;

    // load also all Events the current user has voted for already
    DO.httpSvc({
        method: 'GET',
        url: DO.appweburl + "/_api/web/lists/getbytitle('Votes')/items?$filter=Author eq " + getUser.d.Id,
        headers: { "Accept": "application/json; odata=verbose" }
    })
    .success(function (data, status, headers, config) {
        
        var eventIds = [];
        for (var i = 0; i < data.d.results.length; i++ in data.d.results) {
            var voteEventId = data.d.results[i].DO_EventId;

            if (eventIds.indexOf(voteEventId) < 0) {
                eventIds.push(voteEventId);
                query += " or GUID eq '" + voteEventId +"'";
            }
        }

        DO.httpSvc({
            method: 'GET',
            url: DO.appweburl + "/_api/web/lists/getbytitle('Events')/items?$orderby=Title&" + query + "&orderby=Title",
            headers: { "Accept": "application/json; odata=verbose" }
        })
        .success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            // Returning the results from event list
            var res = data;

            //Mapping between SharePoint columns and Event Model
            DO.event_scope.temp_event = [];
            for (var i = 0; i < res.d.results.length; i++ in res.d.results) {
                var event = res.d.results[i];
                DO.event_scope.temp_event.push({
                    Title: event.Title,
                    DO_Location: event.DO_Location,
                    DO_Description: event.DO_Description,
                    GUID: event.GUID,
                    AuthorId: event.AuthorId
                })
            }            

            // get CreatedBy for each event
            var loadedAuthorsOfEvents = 0;
            for (var i = 0; i < DO.event_scope.temp_event.length; i++) {
                DO.httpSvc({
                    method: 'GET',
                    url: DO.appweburl + "/_api/web/GetUserById(" + DO.event_scope.temp_event[i].AuthorId + ")",
                    headers: { "Accept": "application/json; odata=verbose" }
                })
                .success(function (data, status, headers, config) {
                    var user = data.d;
                    for (var j = 0; j < DO.event_scope.temp_event.length; j++) {

                        if (DO.event_scope.temp_event[j].AuthorId == user.Id) {
                            DO.event_scope.temp_event[j].AuthorName = user.Title;
                        }
                    }

                    loadedAuthorsOfEvents++;
                    if (DO.event_scope.temp_event.length == loadedAuthorsOfEvents) {

                        DO.event_scope.events = DO.event_scope.temp_event;
                        DO.event_scope.temp_event = undefined;
                        DO.alertsMgr.addAlert("Events sucessfully loaded", DO.helper.alert_type.success);
                    }
                })
                .error(function (data, status, headers, config) {
                    that.error(data, status, headers, config);
                });
            }
        })
        .error(function(data, status, headers, config) {
            that.error(data, status, headers, config);
        });
    })    
    .error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      DO.alertsMgr.addAlert("Loading events failed. Please try again.", DO.helper.alert_type.error);
      console.log("Loading events failed: " + typeof data != "undefined" && data !="" ?  data.error.message.value : status);
    });
}

DO.app.factory('EventService', function () {
    return{
        createEvent: function (listName, item) {
            return DO.createItem(listName, item);
        },
        //Load events for current user
        processEvents: function () {
            var eventCondition = DO.prepareURL("eventid");
            var getUser = DO.getCurrentUser(DO.appweburl);

            getUser.success(
                function (data) {
                    DO.getEvents(data, eventCondition);
                }
            ).error(function (data) {
                DO.alertsMgr.addAlert("Failed to load user data. Please try again", DO.helper.alert_type.error);
                console.log("Failed to load user data. Please try again: " + typeof data != "undefined" && data !="" ?  data.error.message.value : status);
            });
        },
        getEvents: function(){
            return DO.event_scope.events;
        }
    }
});
