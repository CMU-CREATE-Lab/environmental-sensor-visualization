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
   var noArraysMsg = "The org.cmucreatelab.util.Arrays library is required by org.cmucreatelab.visualization.speck.SpeckDevices.js";
   alert(noArraysMsg);
   throw new Error(noArraysMsg);
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.cmucreatelab.visualization.speck.SpeckDevices = function(metadata, dataArrayBuffer) {

      var globalMinTime = new Date().getTime() / 1000;
      var globalMaxTime = 0;
      var devicesByName = {};

      // The "constructor"
      (function() {
         var dataView = new DataView(dataArrayBuffer);
         var recordSize = Int32Array.BYTES_PER_ELEMENT + Int32Array.BYTES_PER_ELEMENT;
         console.log("dataView size (bytes): " + dataView.byteLength);
         console.log("record size (bytes):   " + recordSize);
         console.log("num data samples:      " + (dataView.byteLength / recordSize));

         //--------------------------------------

         // First compute the global min and max times and populate the devicesByName map.
         var numDevices = 0;
         for (var i = 0; i < metadata['devices'].length; i++) {
            var device = metadata['devices'][i];
            if (device['numRecords'] > 0) {
               globalMinTime = Math.min(globalMinTime, device['minTime']);
               globalMaxTime = Math.max(globalMaxTime, device['maxTime']);
               devicesByName[device['name']] = device;
               numDevices++;
            }
         }
         console.log("numDevices:      " + numDevices);
         console.log("global min time: " + globalMinTime);
         console.log("global max time: " + globalMaxTime);

         for (var deviceName in devicesByName) {
            var device = devicesByName[deviceName];
            //console.log("Device:" + device['name']);
            device['times'] = new Int32Array(device['numRecords']);
            device['values'] = new Int32Array(device['numRecords']);
            globalMinTime = Math.min(globalMinTime, device['minTime']);
            globalMaxTime = Math.max(globalMaxTime, device['maxTime']);
            var idx = 0;
            var startingByte = device['recordOffset'] * recordSize;
            var endingByte = startingByte + (device['numRecords'] * recordSize);
            //console.log("Bytes [" + startingByte + "] - [" + endingByte + "]");
            for (var j = startingByte; j < endingByte; j += recordSize) {
               device['times'][idx] = dataView.getInt32(j);
               device['values'][idx] = dataView.getInt32(j + Int32Array.BYTES_PER_ELEMENT);
               idx++;
            }
         }

         console.log("SpeckData initialization complete!");
      })();

      this.getGlobalTimeRange = function() {
         return {min : globalMinTime, max : globalMaxTime};
      }

      this.forEach = function(callback) {
         if (typeof callback === 'function') {
            for (var name in devicesByName) {
               callback(name, devicesByName[name]);
            }
         }
      };

      this.findByName = function(name) {
         return devicesByName[name];
      }

      this.clampTimeToInterval = function(device, t) {
         return t - (t % device['valueInterval'])
      }

      this.getValueAtTime = function(device, timeInSecs) {
         var valueIndex = org.cmucreatelab.util.Arrays.binarySearch(device['times'], this.clampTimeToInterval(device, timeInSecs), org.cmucreatelab.util.Arrays.NUMERIC_COMPARATOR);
         return (valueIndex < 0) ? null : device['values'][valueIndex];
      };
   };
})();
