//======================================================================================================================
// An encapsulation of Speck device data, for use by org.cmucreatelab.visualization.DataManager.
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
if (!org.cmucreatelab.visualization.speck) {
   org.cmucreatelab.visualization.speck = {};
}
else {
   if (typeof org.cmucreatelab.visualization.speck != "object") {
      var orgCmucreatelabVisualizationSpeckExistsMessage = "Error: failed to create org.cmucreatelab.visualization.speck namespace: org.cmucreatelab.visualization.speck already exists and is not an object";
      alert(orgCmucreatelabVisualizationSpeckExistsMessage);
      throw new Error(orgCmucreatelabVisualizationSpeckExistsMessage);
   }
}
//======================================================================================================================

//======================================================================================================================
// DEPENDECIES
//======================================================================================================================
if (!org.cmucreatelab.util.Arrays) {
   var noArraysMsg = "The org.cmucreatelab.util.Arrays library is required by org.cmucreatelab.visualization.speck.SpeckDevicesRaggedData.js";
   alert(noArraysMsg);
   throw new Error(noArraysMsg);
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.cmucreatelab.visualization.speck.SpeckDevicesRaggedData = function(metadata, dataArrayBuffer) {

      var globalMinTime = new Date().getTime() / 1000;
      var globalMaxTime = 0;
      var devicesByName = {};
      var deviceTimesAndValues = {};
      var self = this;

      var VALUE_INTERVAL = metadata['valueIntervalSecs'];

      this.clampTimeToInterval = function(t) {
         return t - (t % VALUE_INTERVAL);
      };

      // The "constructor"
      (function() {
         var dataView = new DataView(dataArrayBuffer);
         var recordSize = Int32Array.BYTES_PER_ELEMENT + Int32Array.BYTES_PER_ELEMENT;
         console.log("dataView size (bytes): " + dataView.byteLength);
         console.log("record size (bytes):   " + recordSize);
         console.log("num data samples:      " + (dataView.byteLength / recordSize));

         // First compute the global min and max times and populate the devicesByName map.
         var numDevices = 0;
         for (var n = 0; n < metadata['devices'].length; n++) {
            var device = metadata['devices'][n];
            if (device['numRecords'] > 0) {
               var deviceName = device['name'];
               console.log("Processing device [" + deviceName + "]");
               globalMinTime = Math.min(globalMinTime, device['minTime']);
               globalMaxTime = Math.max(globalMaxTime, device['maxTime']);
               devicesByName[deviceName] = device;
               deviceTimesAndValues[deviceName] = {times : new Int32Array(device['numRecords']), values : new Int32Array(device['numRecords'])};

               var startingByte = device['recordOffset'] * recordSize;
               var endingByte = startingByte + (device['numRecords'] * recordSize);
               var i = 0;
               for (var k = startingByte; k < endingByte; k += recordSize) {
                  deviceTimesAndValues[deviceName]['times'][i] = dataView.getInt32(k);
                  deviceTimesAndValues[deviceName]['values'][i] = dataView.getInt32(k + Int32Array.BYTES_PER_ELEMENT);
                  i++;
               }
               numDevices++;
            }
         }
         console.log("numDevices:      " + numDevices);
         console.log("global min time: " + globalMinTime);
         console.log("global max time: " + globalMaxTime);

         console.log("SpeckDevicesRaggedData initialization complete!");
      })();

      this.getGlobalTimeRange = function() {
         return {min : globalMinTime, max : globalMaxTime};
      };

      this.forEach = function(callback) {
         if (typeof callback === 'function') {
            for (var name in devicesByName) {
               callback(name, devicesByName[name]);
            }
         }
      };

      this.findByName = function(name) {
         return devicesByName[name];
      };

      this.getNearestPreviousValueAtTime = function(device, timeInSecs) {
         var deviceName = device['name'];
         var times = deviceTimesAndValues[deviceName]['times'];
         var values = deviceTimesAndValues[deviceName]['values'];

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

         return {time : times[index], val : values[index]};
      };

      this.isFixedIntervalData = function() {
         return false;
      };
   };
})();
