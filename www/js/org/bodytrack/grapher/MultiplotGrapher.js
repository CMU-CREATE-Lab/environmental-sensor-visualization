//======================================================================================================================
// Class for building a Bodytrack Grapher capable of rendering multiple plots at one, and which manages the plots
// themselves, as well as the X and Y axes.
//
// Dependencies:
// * jQuery (http://jquery.com/)
// * The GWT grapher (gwt/grapher2.nocache.js)
// * org.bodytrack.grapher.ChannelDatasource (or something that provides the same API)
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
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.bodytrack.grapher.MultiplotGrapher = function(dateAxis) {

      var plotsAndYAxes = {};

      var createYAxis = function(channel, yAxisElementId) {
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

      this.addPlot = function(plotId, channel, channelDatasource, yAxisElementId) {
         var yAxis = createYAxis(channel, yAxisElementId);
         var plot = new DataSeriesPlot(channelDatasource,
                                       dateAxis,
                                       yAxis,
                                       {"style" : channel["style"], "localDisplay" : channel["time_type"] == "local"});
         plotsAndYAxes[plotId] = {
            plot : plot,
            yAxis : yAxis,
            yAxisElementId : yAxisElementId
         };
      };

      this.addDataPointListener = function(plotId, listener) {
         plotsAndYAxes[plotId]['plot'].addDataPointListener(listener);
      };

      this.getYAxis = function(plotId) {
         return plotsAndYAxes[plotId]['yAxis'];
      };

      this.getPlot = function(plotId) {
         return plotsAndYAxes[plotId]['plot'];
      };

      this.updateYAxesSizes = function() {
         for (var plotId in plotsAndYAxes) {
            var yAxisElementId = plotsAndYAxes[plotId]['yAxisElementId']
            var yAxisElement = $("#" + yAxisElementId);
            plotsAndYAxes[plotId]['yAxis'].setSize(yAxisElement.width(), yAxisElement.height(), SequenceNumber.getNext())
         }
      };

      this.removePlot = function(plotId) {
         delete plotsAndYAxes[plotId];
      };
   };
})();