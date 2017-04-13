'use strict';


DO.votesctrl = {};
DO.votesctrl.httpSvc = null;
DO.votesctrl.votes_scope = null;

DO.app.controller('VotesCtrl', function ($scope, $http, VotesManager) {
    DO.votesctrl.votes_scope = $scope;
    DO.votesctrl.httpSvc = $http;

    $scope.event = VotesManager.event;
    $scope.dateProposals = VotesManager.dates;
    $scope.currentUser = VotesManager.currentUser;
    $scope.isInVoteMode = DO.helper.isInVoteMode();
    $scope.vote = function (date,index) {
        VotesManager.vote(date,index);
    }
    $scope.hideVoteIcon = function(dateProposal){
        return (!dateProposal.DO_Voted);
    }
    $scope.hideVoteButton = function (dateProposal) {
        return (dateProposal.DO_Voted);
    }
    $scope.highlightDate = function (dateProposal) {
        var countMostVotes = 0;

        for (var i = 0; i < $scope.dateProposals.length; i++) {
            if ($scope.dateProposals[i].DO_CountVotes > countMostVotes) {
                countMostVotes = $scope.dateProposals[i].DO_CountVotes;
            }
        }

        if (countMostVotes > 0 && dateProposal.DO_CountVotes == countMostVotes)
            return true;
        return false;
    }
    $scope.closeDialogAndGoToApp = function () {
        DO.helper.displayManageEventsElements();
        DO.eventSvc.processEvents();
        $scope.isInVoteMode = false;
    }
});

DO.app.factory('VotesManager', function () {
    return {
        event: {},
        dates: [],
        currentUser: {},
        processVote: function (_eventscope) {
            this.event.Title = _eventscope.event.Title;
            this.event.DO_Location = _eventscope.event.DO_Location;
            this.event.DO_Description = _eventscope.event.DO_Description;
            this.event.DO_EventId = _eventscope.event.GUID;
            //Reset date proposals
            this.dates.length = 0;

            var that = this;
            //Get current user
            this.getUser().success(function (data, status, headers, config) {
                that.currentUser = data;
                that.getDates(_eventscope);
            })
            .error(function (data, status, headers, config) {
                alert("Error getting current user")
            });
        },
        getDates: function () {
            var query = "$filter=DO_EventId eq '" + this.event.DO_EventId + "'";
            //Save this context, this has another meaning in ajax callback method
            var that = this;
                DO.votesctrl.httpSvc({
                method: 'GET',
                url: DO.appweburl + "/_api/web/lists/getbytitle('Dates')/items?" + query,
                headers: { "Accept": "application/json; odata=verbose" }
            })
            .success(function (data, status, headers, config) {
                for (var i = 0; i < data.d.results.length; i++ in data.d.results) {
                    var date = data.d.results[i];
                    that.dates.push({
                        DO_Date: moment(date.DO_StartDate).format("DD-MM-YYYY"),
                        DO_StartDate: moment(date.DO_StartDate).format("HH:mm"),
                        DO_EndDate: moment(date.DO_EndDate).format("HH:mm"),
                        GUID: date.GUID,
                        DO_CountVotes: 0,
                        DO_Votes: [],
                        DO_Voted: false
                    })
                }
                that.getVotes();
            })
            .error(function (data, status, headers, config) {
                alert("Error getting dates");
            });
        },
        getVotes: function () {
            var query = "$filter=DO_EventId eq '" + this.event.DO_EventId + "'";
            //Save this context, this has another meaning in ajax callback method
            var that = this;
            DO.votesctrl.httpSvc({
                method: 'GET',
                url: DO.appweburl + "/_api/web/lists/getbytitle('Votes')/items?" + query,
                headers: { "Accept": "application/json; odata=verbose" }
            })
            .success(function (data, status, headers, config) {
                for (var i = 0; i < data.d.results.length; i++ in data.d.results) {
                    var vote = data.d.results[i];
                    for (var j = 0; j < that.dates.length; j++) {
                        var date = that.dates[j];
                        if (date.GUID.toLowerCase()  == vote.DO_DateId.toLowerCase()) {
                            that.dates[j].DO_CountVotes = ++date.DO_CountVotes;
                            that.dates[j].DO_Votes.push(vote);
                            if (that.currentUser.d.Id == vote.AuthorId) {
                                that.dates[j].DO_Voted = true;
                            }
                        }
                    }
                }
            })
            .error(function (data, status, headers, config) {
                alert("Error getting votes");
            });

        },
        vote: function (proposal,index) {
            var validforvote = false;
            var that = this;
            

            if (typeof this.currentUser.d != "undefined") {
                if ((typeof proposal.DO_Votes != "undefined" && !DO.searchObjArr("AuthorId", this.currentUser.d.Id, proposal.DO_Votes)) || typeof proposal.DO_Votes == "undefined") {
                    //Create vote record
                    var item = {
                        Title: "Vote",
                        DO_DateId: proposal.GUID,
                        DO_EventId: this.event.DO_EventId
                    };
                    $('#' + proposal.GUID).button('loading');
                    DO.createItem("Votes", item, DO.votesctrl.votes_scope.$http)
                        .done(function (data) {
                            //Update the referenced date proposal record
                            for (var i = 0; i < that.dates.length; i++) {
                                if (that.dates[i].GUID == proposal.GUID) {
                                    DO.votesctrl.votes_scope.$apply(function () {
                                        that.dates[i].DO_Voted = true;
                                        that.dates[i].DO_CountVotes = ++that.dates[i].DO_CountVotes;
                                        that.dates[i].DO_Votes.push({ AuthorId: that.currentUser.d.Id });
                                    });
                                }
                            }
                        })
                        .fail(function (data) {
                            alert("Failed to create sample data: " + typeof data.responseJSON != "undefined" ? data.responseJSON.error.message.value : "");
                            console.log("Failed to create sample data: " + typeof data.responseJSON != "undefined" ? data.responseJSON.error.message.value : "");
                            $('#' + proposal.GUID).button('reset');
                        });
                } 
                else {
                    alert("You already voted for this Date Proposal");
                }
            }
        },
        getUser: function () {
            return DO.httpSvc({
                method: 'GET',
                url: DO.appweburl + "/_api/web/currentUser",
                headers: { "Accept": "application/json; odata=verbose" }
            });
        },
        openSharedEvent: function () {
            var eventid = DO.helper.getQueryStringParameter("eventid");
            if (eventid) {
                var that = this;
                var query = "$filter=GUID eq '" + eventid + "'";
                var event = DO.votesctrl.httpSvc({
                    method: 'GET',
                    url: DO.appweburl.replace(/#/g, "") + "/_api/web/lists/getbytitle('Events')/items?" + query,
                    headers: { "Accept": "application/json; odata=verbose" }
                });
                event
                    .success(function (data, status, headers, config) {
                        $('#VoteModal').modal('show');
                        if (data.d.results.length > 0) {
                            that.processVote({ event: data.d.results[0] });
                        } else {
                            alert("Shared event not found.")
                        }
                    })
                    .error(function (data, status, headers, config) {
                        alert("Failed to open shared event");
                    });
            }
        }
    };
});