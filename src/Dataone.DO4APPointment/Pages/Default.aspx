<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>
<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>
<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ID="Content1" ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <SharePoint:ScriptLink Name="~site/Scripts/Libraries/jquery-2.1.4.min.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="/_layouts/15/SP.Runtime.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="/_layouts/15/SP.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="/_layouts/15/SP.UserProfiles.js" runat="server" LoadAfterUI="true" Localizable ="false" />

    <!-- CSS libraries -->
    <SharePoint:CssRegistration Name="<% $SPUrl:~Site/Content/bootstrap.min.css%>" runat="server" After="corev15.css" />
    <SharePoint:CssRegistration Name="<% $SPUrl:~Site/Content/ui-bootstrap-csp.css%>" runat="server" After="bootstrap.min.css" />
    <SharePoint:CssRegistration Name="<% $SPUrl:~Site/Content/bootstrap-datetimepicker.min.css%>" runat="server" After="ui-bootstrap-csp.css" />
    <SharePoint:CssRegistration Name="<% $SPUrl:~Site/Content/App.css%>" runat="server" After="bootstrap-datetimepicker.min.css" />

    <!-- AngularJS, Bootstrap, ... libraries -->
    <SharePoint:ScriptLink Name="~site/Scripts/Libraries/angular.min.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="~site/Scripts/Libraries/bootstrap.min.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="~site/Scripts/Libraries/moment.min.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="~site/Scripts/Libraries/bootstrap-datetimepicker.min.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="~site/Scripts/Libraries/angular-ui/ui-bootstrap.min.js" runat="server" LoadAfterUI="true" Localizable ="false" />

    <!-- Own JavaScripts -->
    <SharePoint:ScriptLink Name="~site/Scripts/App.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="~site/Scripts/EventsCtrl.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="~site/Scripts/NewEventsCtrl.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="~site/Scripts/AlertCtrl.js" runat="server" LoadAfterUI="true" Localizable ="false" />
    <SharePoint:ScriptLink Name="~site/Scripts/VotesCtrl.js" runat="server" LoadAfterUI="true" Localizable ="false" />
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ID="Content2" ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    My Events
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <div ng-app="DO4APPointment">  
     
        <div class="alert_container" ng-controller="AlertCtrl">
            <alert ng-repeat="alert in alerts" type="{{alert.type}}" class="alert {{alert.type}}">{{alert.msg}} <button type="button" class="close" ng-click="closeAlert($index)"><span aria-hidden="true">&times;</span></button></alert>
        </div>

        <div class="input-group" id="searchEventsDiv">
            <span class="input-group-addon" id="search-description">Search for:</span>
            <input type="text" class="form-control" placeholder="Please type..." aria-describedby="search-description" ng-model="search" />         
        </div>

        <br />
        <br />

        <table class="table table-striped table-hover table-responsive" ng-controller="EventsCtrl" id="eventsListTable">
        <tbody>
            <tr>
                <th>Event</th>
                <th>Location</th>
                <th>Description</th>
                <th>Created By</th>
                <th></th>
                <th></th>
                <th></th>
            </tr>
            <tr ng-repeat="event in events | filter:search">
                <td>{{event.Title}}</td>
                <td>{{event.DO_Location}}</td>
                <td>{{event.DO_Description}}</td>
                <td>{{event.AuthorName}}</td>
                <td>
                    <button class="btn btn-primary" type="button" data-toggle="modal"  data-target="#VoteModal" ng-click="openDialog(this)" value="">Details</button>
                </td>
                <td>
                    <div class="btn-group">
                      <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Create Link to Vote <span class="caret"></span>
                      </button>
                      <ul class="dropdown-menu">
                        <li><a href="#" ng-click="copyUrl(event,'modal')" data-toggle="modal" data-target="#copyEventUrlModal">Open dialog</a></li>
                        <li><a href="#" ng-click="copyUrl(event,'clip')" ng-show="doesCurrentBrowserSupportCopyToClipboard()">Copy to clipboard</a></li>
                        <li><a href="#" ng-click="copyUrl(event,'mail')">Write a mail</a></li>
                      </ul>
                    </div>
                </td>
            </tr>
        </tbody>
        </table>
        <div class="modal fade" role="dialog" id="copyEventUrlModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close btn btn-default" data-dismiss="modal">&times;</button>
                        <h3 class="modal-title">Copy link to event</h3>
                    </div>
                    <div class="modal-body">
                        <textarea rows="6" class="form-control" id="copyEventUrlTextarea" ></textarea>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-default" data-dismiss="modal" >Close</button>
                    </div>
                </div>
            </div>
        </div>

        <br />
        <br />
        <div ng-controller="NewEventsCtrl" name="newEventForm" ng-form id="newEventDiv">

            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#newEventModal" ng-click="openDialog()">New Event</button>

            <div class="modal fade" id="newEventModal" role="dialog" close="closeDialog()">
                <div class="modal-dialog">

                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close btn btn-default" ng-click="closeDialog()" data-dismiss="modal">&times;</button>
                            <h3 class="modal-title">Create new event</h3>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="eventName">Name</label>
                                <input type="text" class="form-control" name="eventName" id="eventName" ng-model="newEventModel.name" 
                                    required ng-maxlength="255" placeholder="Please enter the name of the event..."
                                    ng-class="{'redBorder': newEventForm.eventName.$dirty && newEventForm.eventName.$invalid}" />
                            </div>
                            <div class="form-group">
                                <label for="eventLocation">Location</label>
                                <input type="text" class="form-control" name="eventLocation" id="eventLocation" ng-model="newEventModel.location" 
                                    required ng-maxlength="255" placeholder="Please enter the name of the location..."
                                    ng-class="{'redBorder': newEventForm.eventLocation.$dirty && newEventForm.eventLocation.$invalid}" />
                            </div>
                            <div class="form-group">
                                <label for="eventDescription">Description</label>
                                <textarea rows="3" class="form-control" name="eventDescription" id="eventDescription" ng-model="newEventModel.description" 
                                    ng-maxlength="1000" placeholder="You can enter a description optionally..."
                                    ng-class="{'redBorder': newEventForm.eventDescription.$dirty && newEventForm.eventDescription.$invalid}"></textarea>
                            </div>

                            <br />
                            <h4>Define time proposals:</h4>
                            <div class="row">
                                <div class='col-sm-4'>
                                    <label>Date:</label>
                                </div>
                                <div class='col-sm-3'>
                                    <label>Start Date:</label>
                                </div>
                                <div class='col-sm-3'>
                                    <label>End Date:</label>
                                </div>
                            </div>
                            <div ng-repeat="dateProposal in newEventModel.dateProposals">

                                <div class="row">
                                    <div class='col-sm-4'>
                                        <div class="form-group">
                                            <div class='input-group date do-date' >
                                                <input type='text' class="form-control" ng-model="dateProposal.date" 
                                                    required placeholder="DD-MM-YYYY" ng-pattern="/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\d\d$/" />
                                                <span class="input-group-addon">
                                                    <span class="glyphicon glyphicon-calendar"></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class='col-sm-3'>
                                        <div class="form-group">
                                            <div class='input-group date do-time do-startTime' >
                                                <input type='text' class="form-control" ng-model="dateProposal.startTime"
                                                    required placeholder="hh:mm" ng-pattern="/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/"/>
                                                <span class="input-group-addon">
                                                    <span class="glyphicon glyphicon-time"></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class='col-sm-3'>
                                        <div class="form-group">
                                            <div class='input-group date do-time do-endTime' >
                                                <input type='text' class="form-control" ng-model="dateProposal.endTime"
                                                    required placeholder="hh:mm" ng-pattern="/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/"/>
                                                <span class="input-group-addon">
                                                    <span class="glyphicon glyphicon-time"></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <script type="text/javascript">
                                        $(function () {
                                            $('.do-date').datetimepicker({
                                                format: 'DD-MM-YYYY'
                                            });
                                            $('.do-time').datetimepicker({
                                                format: 'HH:mm',
                                                stepping: 15
                                            });
                                            $('.date').on("dp.change", function (e) {
                                                DO.helper.triggerEventDateChange(e);
                                            });
                                        });
                                    </script>
                                </div>

                            </div> 
                            <button type="button" class="btn btn-primary" ng-click="addProposalDate()">Add new Date</button>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-default" data-dismiss="modal" ng-click="closeDialog()">Cancel</button>
                            <button class="btn" data-dismiss="modal" ng-click="saveNewEvent()" 
                                ng-disabled="newEventForm.$invalid" ng-class="{'btn-success': newEventForm.$valid}">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
                        
        </div>
        <div ng-controller="VotesCtrl">
            <div class="modal fade" id="VoteModal" role="dialog" close="closeDialog()">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close btn btn-default" data-dismiss="modal"
                                ng-show="!isInVoteMode" ng-click="closeDialog()">&times;</button>
                            <h3 class="modal-title">Vote for event</h3>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Name:</label><br />
                                <p>{{event.Title}}</p>
                            </div>
                            <div class="form-group">
                                <label>Location:</label><br />
                                <p>{{event.DO_Location}}</p>
                            </div>
                            <div class="form-group">
                                <label>Description:</label><br />
                                <p>{{event.DO_Description}}</p>
                            </div>

                            <br />
                            <h4>Vote for time proposals:</h4>
                            <br />

                            <!-- dates-->
                            <table class="table table-striped table-hover table-responsive">
                                <tbody>
                                    <tr>
                                        <th>Date</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Count Votes</th>
                                        <th>My votes</th>
                                    </tr>
                                    <tr ng-repeat="dateProposal in dateProposals | orderBy:['DO_Date', 'DO_StartDate']" ng-class="{'info': highlightDate(dateProposal)}">
                                        <td>{{dateProposal.DO_Date}}</td>
                                        <td>{{dateProposal.DO_StartDate}}</td>
                                        <td>{{dateProposal.DO_EndDate}}</td>
                                        <td>{{dateProposal.DO_CountVotes}}</td>
                                        <td>
                                            <button id="{{dateProposal.GUID}}" class="btn btn-primary btn-sm" type="button"  ng-class="{'hide' : hideVoteButton(dateProposal), 'show': !hideVoteButton(dateProposal)}" ng-click="vote(dateProposal,$index)"  value="" data-loading-text="Voting..." autocomplete="off">Vote</button>
                                            <span class="glyphicon glyphicon-thumbs-up" aria-hidden="true" ng-class="{'hide' : hideVoteIcon(dateProposal), 'show': !hideVoteIcon(dateProposal)}"></span>
                                        </td>
                                    </tr>
                                    </tbody>
                            </table>
                            </div> 
                        <div class="modal-footer">
                            <button class="btn btn-default" data-dismiss="modal" id="closeDetailsDialog"
                                ng-show="!isInVoteMode">Close</button>
                            <button class="btn btn-default" data-dismiss="modal" id="closeDialogAndGoToApp"
                                ng-click="closeDialogAndGoToApp()" ng-show="isInVoteMode">Go To APPointments</button>
                        </div>
                        </div>
                </div>
            </div>            
        </div>

    </div>

</asp:Content>
