//======================================================================================================================
// A data manager for preloaded, interval data.  We define "interval data" as data that is reported at fixed, known
// interval between reports (e.g. a Speck sensor configured to record samples every 5 seconds).  The DataManager expects
// to be given an object which implements the methods specified by org.cmucreatelab.visualization.Devices.
//
// Dependencies:
// * Google Maps API
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
if (!org.cmucreatelab) {
   org.cmucreatelab = {};
}
else {
   if (typeof org.cmucreatelab != "object") {
      var orgCmucreatelabExistsMessage = "Error: failed to create org.cmucreatelab namespace: org.cmucreatelab already exists and is not an object";
      alert(orgCmucreatelabExistsMessage);
      throw new Error(orgCmucreatelabExistsMessage);
   }
}

// Repeat the creation and type-checking for the next level
if (!org.cmucreatelab.visualization) {
   org.cmucreatelab.visualization = {};
}
else {
   if (typeof org.cmucreatelab.visualization != "object") {
      var orgCmucreatelabVisualizationExistsMessage = "Error: failed to create org.cmucreatelab.visualization namespace: org.cmucreatelab.visualization already exists and is not an object";
      alert(orgCmucreatelabVisualizationExistsMessage);
      throw new Error(orgCmucreatelabVisualizationExistsMessage);
   }
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.cmucreatelab.visualization.DataManager = function(devices) {

      var currentLatLongBounds = null;
      var currentTimeRange = null;              // stores both the current time range and the cursor's position
      var dataChangeListeners = [];

      this.addDataChangeListener = function(listener) {
         if (typeof listener === 'function') {
            dataChangeListeners.push(listener);
         }
      }

      this.getGlobalTimeRange = function() {
         return devices.getGlobalTimeRange();
      }

      this.setLatLongBounds = function(latLongBounds) {
         if (latLongBounds != null) {
            var hasChanged = (currentLatLongBounds == null ||
                              currentLatLongBounds.getNorthEast().lat() != latLongBounds.getNorthEast().lat() ||
                              currentLatLongBounds.getNorthEast().lng() != latLongBounds.getNorthEast().lng() ||
                              currentLatLongBounds.getSouthWest().lat() != latLongBounds.getSouthWest().lat() ||
                              currentLatLongBounds.getSouthWest().lng() != latLongBounds.getSouthWest().lng());
            currentLatLongBounds = latLongBounds;
            if (hasChanged) {
               // TODO: Someday filter the set of devices based on lat/long
            }
         }
      };

      this.setTimeRange = function(newTimeRange) {
         if (newTimeRange != null) {
            var hasTimeRangeChanged = (currentTimeRange == null || newTimeRange['min'] != currentTimeRange['min'] || newTimeRange['max'] != currentTimeRange['max']);
            var hasTimeCursorChanged = (currentTimeRange == null || newTimeRange['cursorPosition'] != currentTimeRange['cursorPosition']);
            currentTimeRange = newTimeRange;
            if (hasTimeRangeChanged) {
               // TODO: Maybe someday filter the set of devices based on time range
            }
            else if (hasTimeCursorChanged) {
               // publish event, including the current channel values
               var changeEvent = createDataChangeEvent();
               for (var i = 0; i < dataChangeListeners.length; i++) {
                  dataChangeListeners[i](changeEvent);
               }
            }
         }
      };

      this.forEachDevice = function(callback) {
         devices.forEach(callback);
      };

      this.findByName = function(name) {
         return devices.findByName(name);
      }

      this.getChannelDatasource = function(name) {
         return function(level, offset, successCallback) {
            var sampleWidthInSecs = Math.pow(2, level);
            var offsetTimeInSecs = offset * 512 * sampleWidthInSecs;

            var json = {
               "fields" : ["time", "mean", "stddev", "count"],
               "level" : level,
               "offset" : offset,
               "sample_width" : sampleWidthInSecs,
               "data" : [],
               "type" : "value"
            };

            var device = devices.findByName(name);
            var t = offsetTimeInSecs;
            var previousClampedTime = null;
            var previousClampedValue = null;
            for (var i = 0; i < 512; i++) {
               var clampedTime = devices.clampTimeToInterval(device, t);
               if (clampedTime != previousClampedTime) {
                  var value = devices.getValueAtTime(device, clampedTime);
                  if (value != null) {
                     json['data'].push([clampedTime, value, 0, 0])
                  }
                  previousClampedValue = value;
               }
               previousClampedTime = clampedTime;
               t += sampleWidthInSecs;
            }

            successCallback(JSON.stringify(json));
         };
      }

      var createDataChangeEvent = function() {
         // TODO: improve this by only including devices whose clamped time has actually changed
         var values = {};
         devices.forEach(function(name, device) {
            values[name] = devices.getValueAtTime(device, currentTimeRange['cursorPosition']);
         });

         return values;
      }
   };
})();
