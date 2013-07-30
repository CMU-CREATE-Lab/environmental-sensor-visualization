//======================================================================================================================
// A representation of a BodyTrack Datastore.
//
// Dependencies: none
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
if (!org.bodytrack.datastore) {
   org.bodytrack.datastore = {};
}
else {
   if (typeof org.bodytrack.datastore != "object") {
      var orgBodytrackDatastoreExistsMessage = "Error: failed to create org.bodytrack.datastore namespace: org.bodytrack.datastore already exists and is not an object";
      alert(orgBodytrackDatastoreExistsMessage);
      throw new Error(orgBodytrackDatastoreExistsMessage);
   }
}
//======================================================================================================================

//======================================================================================================================
// DEPENDECIES
//======================================================================================================================
if (!org.bodytrack.datastore.ChannelDatasource) {
   var noChannelDatasourceMsg = "The org.bodytrack.datastore.ChannelDatasource library is required by org.bodytrack.datastore.FakeDatastore.js";
   alert(noChannelDatasourceMsg);
   throw new Error(noChannelDatasourceMsg);
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.bodytrack.datastore.FakeDatastore = function(initialDevicesAndChannels) {

      var valueFunctionsAndDatasources = {};

      this.createChannelDatasource = function(deviceName, channelName, getValueAtTime) {

         var datasource = function(level, offset, successCallback) {
            var sampleWidthInSecs = Math.pow(2, level);
            var offsetTimeInSecs = offset * 512 * sampleWidthInSecs;

            var json = {
               "fields" : ["time", "mean", "stddev", "count"],
               "level" : level,
               "offset" : offset,
               "sample_width" : sampleWidthInSecs,
               "data" : []
            };

            var t = offsetTimeInSecs;
            for (var i = 0; i < 512; i++) {
               json['data'].push([t, getValueAtTime(t), 0, 0])
               t += sampleWidthInSecs;
            }

            successCallback(JSON.stringify(json));
         };

         registerValueFunctionAndDatasource(deviceName, channelName, getValueAtTime, datasource);

         return  datasource;
      };

      this.getValueAtTime = function(deviceName, channelName, timeInSecs) {
         return valueFunctionsAndDatasources[deviceName][channelName]['valueFunction'](timeInSecs);
      };

      this.getDatasource = function(deviceName, channelName) {
         return valueFunctionsAndDatasources[deviceName][channelName]['datasource'];
      };

      this.getIt = function() {
         return valueFunctionsAndDatasources;
      }

      var registerValueFunctionAndDatasource = function(deviceName, channelName, valueFunction, datasource) {
         if (typeof valueFunctionsAndDatasources[deviceName] === 'undefined') {
            valueFunctionsAndDatasources[deviceName] = {}
         }
         if (typeof valueFunctionsAndDatasources[deviceName][channelName] === 'undefined') {
            valueFunctionsAndDatasources[deviceName][channelName] = {}
         }
         valueFunctionsAndDatasources[deviceName][channelName]['valueFunction'] = valueFunction;
         valueFunctionsAndDatasources[deviceName][channelName]['datasource'] = datasource;
      };

      // initialize
      if (initialDevicesAndChannels != null) {
         for (var i = 0; i < initialDevicesAndChannels.length; i++) {
            var device = initialDevicesAndChannels[i];
            var channels = device['channels'];
            for (var j = 0; j < channels.length; j++) {
               var channel = channels[j];
               this.createChannelDatasource(device['name'],
                                            channel['name'],
                                            channel['valueFunction']);
            }
         }
      }
   };
})();

