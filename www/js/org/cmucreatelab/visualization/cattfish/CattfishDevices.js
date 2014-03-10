//======================================================================================================================
// An encapsulation of CATTFish device data, for use by org.cmucreatelab.visualization.DataManager.
//
// Dependencies:
// * org.cmucreatelab.util.Arrays
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

// Repeat the creation and type-checking for the next level
if (!org.cmucreatelab.visualization.cattfish) {
   org.cmucreatelab.visualization.cattfish = {};
}
else {
   if (typeof org.cmucreatelab.visualization.cattfish != "object") {
      var orgCmucreatelabVisualizationCattfishExistsMessage = "Error: failed to create org.cmucreatelab.visualization.cattfish namespace: org.cmucreatelab.visualization.cattfish already exists and is not an object";
      alert(orgCmucreatelabVisualizationCattfishExistsMessage);
      throw new Error(orgCmucreatelabVisualizationCattfishExistsMessage);
   }
}
//======================================================================================================================

//======================================================================================================================
// DEPENDECIES
//======================================================================================================================
if (!org.cmucreatelab.util.Arrays) {
   var noArraysMsg = "The org.cmucreatelab.util.Arrays library is required by org.cmucreatelab.visualization.cattfish.CattfishDevices.js";
   alert(noArraysMsg);
   throw new Error(noArraysMsg);
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.cmucreatelab.visualization.cattfish.CattfishDevices = function(deviceInstallations) {

      var globalMinTime = new Date().getTime() / 1000;
      var globalMaxTime = 0;
      var self = this;

      // The "constructor"
      (function() {
         // First compute the global min and max times.
         var numDevices = 0;
         for (var deviceId in deviceInstallations) {
            var deviceInstallation = deviceInstallations[deviceId];
            var device = deviceInstallation['device'];
            globalMinTime = Math.min(globalMinTime, device['timestamp_gmt_secs']['min']);
            globalMaxTime = Math.max(globalMaxTime, device['timestamp_gmt_secs']['max']);
            numDevices++;
         }
         console.log("numDevices:      " + numDevices);
         console.log("global min time: " + globalMinTime);
         console.log("global max time: " + globalMaxTime);

         console.log("CattfishDevices initialization complete!");
      })();

      this.getGlobalTimeRange = function() {
         return {min : globalMinTime, max : globalMaxTime};
      };

      this.forEach = function(callback) {
         if (typeof callback === 'function') {
            for (var name in deviceInstallations) {
               callback(name, deviceInstallations[name]);
            }
         }
      };

      this.findByName = function(name) {
         return deviceInstallations[name];
      };

      var VALUE_INTERVAL = 1; // TODO
      this.clampTimeToInterval = function(t) {
         return t - (t % VALUE_INTERVAL);
      };

      this.getValueAtTime = function(device, timeInSecs) {
         return null;
      };

      this.getNearestPreviousValueAtTime = function(device, timeInSecs) {
         var times = device['device']['timestamp_gmt_secs']['values'];
         var conductivityValues = device['device']['conductivity']['values'];
         var temperatureValues = device['device']['temp_c']['values'];

         var index = null;
         if (timeInSecs < times[0]) {
            return null;
         }
         else if (timeInSecs > times[times.length - 1]) {
            index = times.length - 1;
         }
         else {
            index = org.cmucreatelab.util.Arrays.binarySearch(times, timeInSecs, org.cmucreatelab.util.Arrays.NUMERIC_COMPARATOR);
            if (index < 0) {
               index = ~index - 1;
            }
            else {
               // If the timeInSecs exists in the times array, then we want the PREVIOUS one.  Need to be careful about
               // the case were we ask for--and get--the very first element in the array.  There is no previous element
               // in that case, so return null.
               index = index - 1;

               if (index < 0) {
                  return null;
               }
            }
         }

         return {time : times[index], val : conductivityValues[index], temp : temperatureValues[index]};
      };

      this.isFixedIntervalData = function() {
         return false;
      };
   };
})();
