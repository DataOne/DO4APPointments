'use strict';

DO.variable = null;

DO.app.controller('NewEventsCtrl', function ($scope, $http, EventService) {

    DO.variable = $scope;
    var DateProposal = function (date, startTime, endTime) {
        var that = this;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        
        this.getStartDate = function () {
            return new Date(
                that.date.substring(6, 10),
                parseInt(that.date.substring(3, 5)) - 1,
                that.date.substring(0, 2),
                that.startTime.substring(0, 2),
                that.startTime.substring(3, 5)
                );
        }

        this.getEndDate = function () {
            return new Date(
                that.date.substring(6, 10),
                parseInt(that.date.substring(3, 5)) - 1,
                that.date.substring(0, 2),
                that.endTime.substring(0, 2),
                that.endTime.substring(3, 5)
                );
        }
    }

    $scope.openDialog = function () {
        // build up event controller
        $scope.newEventModel = {};
        $scope.newEventModel.dateProposals = new Array();

        // reset validation
        $scope.newEventForm.$setPristine();
        $scope.newEventForm.$setUntouched();

        $scope.newEventModel.dateProposals.push(new DateProposal(null, null, null));
    };
    
    $scope.addProposalDate = function () {
        $scope.newEventModel.dateProposals.push(new DateProposal(null, null, null));
    };

    $scope.closeDialog = function () {
        // clean up controller
        $scope.newEventModel = null;
    };

    $scope.saveNewEvent = function () {

        // create event
        var insertEvent = {
            Title: $scope.newEventModel.name,
            DO_Location: $scope.newEventModel.location,
            DO_Description: $scope.newEventModel.description
        };
        var promiseCreateEvent = DO.createItem("Events", insertEvent);

        promiseCreateEvent.done(function (data) {
            
            // create date proposals
            var processedItems = 0;
            var eventId = data.d.GUID;

            $.each($scope.newEventModel.dateProposals, function (index, date) {

                var insertDate = {
                    DO_EventId: eventId,
                    DO_StartDate: date.getStartDate(),
                    DO_EndDate: date.getEndDate()
                    }

                var promiseCreateDate = DO.createItem("Dates", insertDate);

                promiseCreateDate.done(function (data) {

                    processedItems++;
                    if (processedItems === $scope.newEventModel.dateProposals.length) {

                        DO.alertsMgr.addAlert("Successfully created new Event", DO.helper.alert_type.success);
                        console.log("Successfully created one new Event and "
                            + processedItems
                            + " time proposal(s)");

                        EventService.processEvents();
                    }

                }).fail(function (data) {
                    DO.alertsMgr.addAlert("Failed to create new Event", DO.helper.alert_type.error);
                    console.log("Failed to create Time Proposal during creating new Event: "
                        + typeof data.responseJSON != "undefined" ? data.responseJSON.error.message.value : "");
                });
            });

        }).fail(function (data) {
            DO.alertsMgr.addAlert("Failed to create new Event", DO.helper.alert_type.error);
            console.log("Failed to create new Event element: " + typeof data.responseJSON != "undefined" ? data.responseJSON.error.message.value : "");
        });
    };
});

DO.helper = DO.helper || {};

DO.helper.triggerEventDateChange = function (event) {

    var elementScope = angular.element(event.target).scope();
    var inputElement = $(event.target).children("input");
    var newValue = inputElement[0].value;

    if ($(event.target).hasClass("do-date")) {
        elementScope.dateProposal.date = newValue;
        inputElement.change();
    }
    else if ($(event.target).hasClass("do-startTime")) {
        elementScope.dateProposal.startTime = newValue;
        inputElement.change();

        // set end time to same value if it's empty or minor than start date
        if (elementScope.dateProposal.endTime == null
            || (elementScope.dateProposal.startTime != null && elementScope.dateProposal.startTime.length == 5 
                && elementScope.dateProposal.endTime.length == 5 && getDate(elementScope.dateProposal.endTime) < getDate(elementScope.dateProposal.startTime))) {
            elementScope.dateProposal.endTime = newValue;
            var endTimeElement = $(event.target).closest(".row").find(".do-endTime").find("input");
            endTimeElement.val(newValue);
            endTimeElement.change();
        }
    }
    else if ($(event.target).hasClass("do-endTime")) {
        elementScope.dateProposal.endTime = newValue;
        inputElement.change();

        // set start time to same value if it's later than end date
        if (elementScope.dateProposal.startTime != null && elementScope.dateProposal.startTime.length == 5
                && elementScope.dateProposal.endTime != null && elementScope.dateProposal.endTime.length == 5
                && getDate(elementScope.dateProposal.endTime) < getDate(elementScope.dateProposal.startTime)) {
            elementScope.dateProposal.startTime = newValue;
            var startTimeElement = $(event.target).closest(".row").find(".do-startTime").find("input");
            startTimeElement.val(newValue);
            startTimeElement.change();
        }
    }

    function getDate(timeString) {
        return new Date(2000, 1, 1,
            timeString.substring(0, 2),
            timeString.substring(3, 5), 
            0, 0);
    }
}