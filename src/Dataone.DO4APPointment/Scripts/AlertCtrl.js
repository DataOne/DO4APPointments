'use strict';

DO.app.controller('AlertCtrl', function ($scope, AlertsManager) {
    $scope.alerts = AlertsManager.alerts;
    
    $scope.closeAlert = function (index) {
        AlertsManager.removeAlert(index);
    };

});

DO.app.factory('AlertsManager', function () {
    var privateAlerts = [];
    return {
        alerts: [],
        addAlert: function (message, _type) {
            this.alerts.push({ msg: message, type: _type });
        },
        removeAlert: function (index) {
            this.alerts.splice(index, 1);
        }
    };
});