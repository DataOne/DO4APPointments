'use strict';

var DO = DO || {};

DO.hostweburl = "";
DO.appweburl = "";

DO.app = angular.module('DO4APPointment', []);

$(document).ready(function () {
    DO.helper.changeLogo();

    try {
        // At the begin of a page life cycle, check whether App is called in Vote or ManageEvents mode
        if (DO.helper.isInVoteMode()) {
            DO.votesMgr.openSharedEvent();
        }
        else {
            DO.helper.displayManageEventsElements();
            DO.eventSvc.processEvents();
        }
    }
    catch (e) {
        DO.alertsMgr.addAlert("An error occured please try again later..", DO.helper.alert_type.error);
        console.log("An error occured: " + e.message.toString());
    }
});

DO.helper = DO.helper || {};

DO.helper.alert_type = { success: 'alert-success', error: 'alert-danger', warning: "alert-warning" };

DO.helper.isInVoteMode = function () {
    var eventid = DO.helper.getQueryStringParameter("eventid");
    if (eventid) {
        return true;
    }
    return false;
}

DO.helper.getQueryStringParameter = function (paramToRetrieve) {
    var params = document.URL.split("?")[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve) return singleParam[1];
    }
}

DO.helper.changeLogo = function () {
    var siteIcon = $(".ms-siteicon-a img");
    siteIcon.load(function () {
        siteIcon.addClass('show');
    });
    siteIcon.attr('src', DO.appweburl + '/Images/do4appointments_logo_130.jpg');
}

// Get List Item Type metadata
DO.helper.GetItemTypeForListName = function(name) {
    return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
}

DO.helper.displayManageEventsElements = function () {
    $(".alert_container").show();
    $("#DeltaPlaceHolderPageTitleInTitleArea").show();
    $("#searchEventsDiv").css("display", "table");
    $("#eventsListTable").show();
    $("#newEventDiv").show();
}

DO.createItem = function (listName, item) {
    var itemType = DO.helper.GetItemTypeForListName(listName);
    item.__metadata = { "type": itemType };

    return $.ajax({
        url: DO.appweburl + "/_api/web/lists/getbytitle('" + listName + "')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        }
    });
}

//Helper for searching in object arrays
DO.searchObjArr = function(nameKey, value, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i][nameKey] == value) {
            return myArray[i];
        }
    }
}