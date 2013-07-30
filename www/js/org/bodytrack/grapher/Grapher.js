//======================================================================================================================
// Class for building a Bodytrack Grapher, and which manages the plot itself, as well as the X and Y axes.
//
// Dependencies:
// * jQuery (http://jquery.com/)
// * The GWT grapher (gwt/grapher2.nocache.js)
// * org.bodytrack.grapher.ChannelDatasource
//
// Author: Chris Bartley (bartley@cmu.edu)
//======================================================================================================================

//======================================================================================================================
// VERIFY NAMESPACE
//======================================================================================================================
// Create the global symbol "org" if it doesn't exist.  Throw an error if it does exist but is not an object.
var org;
if (!org) {
   org = {};
}
else {
   if (typeof org != "object") {
      var orgExistsMessage = "Error: failed to create org namespace: org already exists and is not an object";
      alert(orgExistsMessage);
      throw new Error(orgExistsMessage);
   }
}

// Repeat the creation and type-checking for the next level
if (!org.bodytrack) {
   org.bodytrack = {};
}
else {
   if (typeof org.bodytrack != "object") {
      var orgBodytrackExistsMessage = "Error: failed to create org.bodytrack namespace: org.bodytrack already exists and is not an object";
      alert(orgBodytrackExistsMessage);
      throw new Error(orgBodytrackExistsMessage);
   }
}

// Repeat the creation and type-checking for the next level
if (!org.bodytrack.grapher) {
   org.bodytrack.grapher = {};
}
else {
   if (typeof org.bodytrack.grapher != "object") {
      var orgBodytrackGrapherExistsMessage = "Error: failed to create org.bodytrack.grapher namespace: org.bodytrack.grapher already exists and is not an object";
      alert(orgBodytrackGrapherExistsMessage);
      throw new Error(orgBodytrackGrapherExistsMessage);
   }
}
//======================================================================================================================

//======================================================================================================================
// DEPENDECIES
//======================================================================================================================
if (!window['$']) {
   var nojQueryMsg = "The jQuery library is required by org.bodytrack.grapher.Grapher.js";
   alert(nojQueryMsg);
   throw new Error(nojQueryMsg);
}
if (!org.bodytrack.datastore.ChannelDatasource) {
   var noChannelDatasourceMsg = "The org.bodytrack.datastore.ChannelDatasource library is required by org.bodytrack.grapher.Grapher.js";
   alert(noChannelDatasourceMsg);
   throw new Error(noChannelDatasourceMsg);
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.bodytrack.grapher.Grapher = function(channel, channelDatasource, dateAxis, yAxisElementId) {

      var createYAxis = function() {
         var yMin = channel.min;
         var yMax = channel.max;
         var yDiff = yMax - yMin;
         var padding = 0.5;
         if (yDiff < 1e-10) {
            padding = 0.5;
         }
         else {
            padding = 0.1 * yDiff;
         }

         return new NumberAxis(yAxisElementId,
                               "vertical",
                               {
                                  "min" : yMin - padding,
                                  "max" : yMax + padding
                               });
      };

      var yAxis = createYAxis();

      var plot = new DataSeriesPlot(channelDatasource,
                                    dateAxis,
                                    yAxis,
                                    {"style" : channel["style"], "localDisplay" : channel["time_type"] == "local"});

      this.getDateAxis = function() {
         return dateAxis;
      }

      this.getYAxis = function() {
         return yAxis;
      }

      this.getPlot = function() {
         return plot;
      }

      this.addDataPointListener = function(listener) {
         plot.addDataPointListener(listener);
      }
   };
})();

