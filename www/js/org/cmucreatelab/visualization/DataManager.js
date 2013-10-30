//======================================================================================================================
// A data manager for preloaded, interval data.  We define "interval data" as data that is reported at fixed, known
// interval between reports (e.g. a Speck sensor configured to record samples every 5 seconds).
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
   org.cmucreatelab.visualization.DataManager = function(metadata, dataArrayBuffer) {

      var FIELD_COMPARATOR = function(fieldName) {
         return function(a, b) {
            if (a[fieldName] < b[fieldName]) {
               return -1;
            }
            if (a[fieldName] > b[fieldName]) {
               return 1;
            }
            return 0;
         }
      };

      var NAME_COMPARATOR = FIELD_COMPARATOR('name')

      var SITE_FIELD_COMPARATOR = function(fieldName) {
         return function(a, b) {
            if (a[fieldName] < b[fieldName]) {
               return -1;
            }
            if (a[fieldName] > b[fieldName]) {
               return 1;
            }

            // TODO: Dunno about this!
            if (typeof b['name'] === 'undefined') {
               return 1;
            }
            return NAME_COMPARATOR(a, b);
         }
      };

      var LATITUDE_COMPARATOR = SITE_FIELD_COMPARATOR('latitude');
      var LONGITUDE_COMPARATOR = SITE_FIELD_COMPARATOR('longitude');

      var globalMinTime = new Date().getTime() / 1000;
      var globalMaxTime = 0;

      var sitesByName = {};

      var currentLatLongBounds = null;
      var currentTimeRange = null;              // stores both the current time range and the cursor's position
      var dataChangeListeners = [];

      // The "constructor"
      (function() {
         var dataView = new DataView(dataArrayBuffer);
         var recordSize = Int32Array.BYTES_PER_ELEMENT + Int16Array.BYTES_PER_ELEMENT;
         console.log("dataView size (bytes): " + dataView.byteLength);
         console.log("record size (bytes):   " + recordSize);
         console.log("num data samples:      " + (dataView.byteLength / recordSize));

         //--------------------------------------

         // First compute the global min and max times and populate the sitesByName map.
         var numSites = 0;
         for (var i = 0; i < metadata['sites'].length; i++) {
            var site = metadata['sites'][i];
            if (site['numRecords'] > 0) {
               globalMinTime = Math.min(globalMinTime, site['minTime']);
               globalMaxTime = Math.max(globalMaxTime, site['maxTime']);
               sitesByName[site['name']] = site;
               numSites++;
            }
         }
         console.log("numSites:        " + numSites);
         console.log("global min time: " + globalMinTime);
         console.log("global max time: " + globalMaxTime);

         for (var siteName in sitesByName) {
            var site = sitesByName[siteName];
            //console.log("Site:" + site['name']);
            site['times'] = new Int32Array(site['numRecords']);
            site['values'] = new Float32Array(site['numRecords']);
            globalMinTime = Math.min(globalMinTime, site['minTime']);
            globalMaxTime = Math.max(globalMaxTime, site['maxTime']);
            var idx = 0;
            var startingByte = site['recordOffset'] * recordSize;
            var endingByte = startingByte + (site['numRecords'] * recordSize);
            //console.log("Bytes [" + startingByte + "] - [" + endingByte + "]");
            for (var j = startingByte; j < endingByte; j += recordSize) {
               site['times'][idx] = dataView.getInt32(j);

               // Get the value, but divide it by 10 because the server has multiplied all
               // values by 10 and saved as shorts in order to save space in the binary file.
               // So, we need to convert back to the actual value here.
               site['values'][idx] = dataView.getInt16(j + Int32Array.BYTES_PER_ELEMENT) / 10.0;
               idx++;
            }
         }

         console.log("Preload complete!");
      })();

      this.addDataChangeListener = function(listener) {
         if (typeof listener === 'function') {
            dataChangeListeners.push(listener);
         }
      }

      this.getGlobalTimeRange = function() {
         return {min : globalMinTime, max : globalMaxTime};
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

      this.forEachSite = function(callback) {
         if (typeof callback === 'function') {
            for (var name in sitesByName) {
               callback(sitesByName[name]);
            }
         }
      };

      this.findByName = function(name) {
         return sitesByName[name];
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
               "data" : []
            };

            var site = sitesByName[name];
            var t = offsetTimeInSecs;
            var previousClampedTime = null;
            var previousClampedValue = null;
            for (var i = 0; i < 512; i++) {
               var clampedTime = clampTimeToInterval(site, t);
               if (clampedTime != previousClampedTime) {
                  var value = getValueAtTime(site, clampedTime);
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

      var clampTimeToInterval = function(site, t) {
         return t - (t % site['valueInterval'])
      }

      var getValueAtTime = function(site, timeInSecs) {
         var valueIndex = org.cmucreatelab.util.Arrays.binarySearch(site['times'], clampTimeToInterval(site, timeInSecs), org.cmucreatelab.util.Arrays.NUMERIC_COMPARATOR);
         return (valueIndex < 0) ? null : site['values'][valueIndex];
      };

      var createDataChangeEvent = function() {
         // TODO: improve this by only including sites whose clamped time has actually changed
         var values = {};
         for (var name in sitesByName) {
            var site = sitesByName[name];
            values[site['name']] = getValueAtTime(site, currentTimeRange['cursorPosition']);
         }

         return values;
      }
   };
})();
