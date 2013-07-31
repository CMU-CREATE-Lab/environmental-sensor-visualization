//======================================================================================================================
// A manager for BodyTrack Datastore devices, including metadata.
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
   var noChannelDatasourceMsg = "The org.bodytrack.datastore.ChannelDatasource library is required by org.bodytrack.datastore.FakeDeviceManager.js";
   alert(noChannelDatasourceMsg);
   throw new Error(noChannelDatasourceMsg);
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.bodytrack.datastore.FakeDeviceManager = function() {
      var DATASOURCE_KEY = '__FakeDeviceManager_datasource';

      var devicesAndChannels = {};

      var deviceInstallations = [];             // ALL device installations
      var filteredDeviceInstallations = {};     // device installations matching the current time range or location bounds
      var deviceInstallationsFilteredByTime = {};
      var numDeviceInstallationsFilteredByTime = 0;
      var deviceInstallationsFilteredByLocation = {};
      var numDeviceInstallationsFilteredByLocation = 0;

      var currentChannelName = "particles";
      var currentLatLongBounds = null;
      var currentTimeRange = null;              // stores both the current time range and the cursor's position
      var deviceInstallationChangeListeners = [];
      var activeDeviceInstallationChangeListeners = [];
      var channelChangeListeners = [];

      this.setCurrentChannelName = function(channelName) {
         currentChannelName = channelName;

         // publish event
         var changeEvent = getChannelValuesOfActiveDeviceInstallations();
         for (var i = 0; i < activeDeviceInstallationChangeListeners.length; i++) {
            channelChangeListeners[i](changeEvent);
         }
      };

      this.getCurrentChannelName = function() {
         return currentChannelName;
      };

      this.setLatLongBounds = function(latLongBounds) {
         if (latLongBounds != null) {
            var hasChanged = (currentLatLongBounds == null ||
                              currentLatLongBounds.getNorthEast().lat() != latLongBounds.getNorthEast().lat() ||
                              currentLatLongBounds.getNorthEast().lng() != latLongBounds.getNorthEast().lng() ||
                              currentLatLongBounds.getSouthWest().lat() != latLongBounds.getSouthWest().lat() ||
                              currentLatLongBounds.getSouthWest().lng() != latLongBounds.getSouthWest().lng());
            currentLatLongBounds = latLongBounds;
            if (hasChanged) {
               // update the set of installations filtered by location
               deviceInstallationsFilteredByLocation = {};
               numDeviceInstallationsFilteredByLocation = 0;
               for (var i = 0; i < deviceInstallations.length; i++) {
                  var deviceInstallation = deviceInstallations[i];
                  var installation = deviceInstallation['installation'];
                  var latLong = installation['location']['latLong'];
                  if (currentLatLongBounds.contains(latLong)) {
                     deviceInstallationsFilteredByLocation[installation['id']] = deviceInstallation;
                     numDeviceInstallationsFilteredByLocation++;
                  }
               }
               updateSetOfFilteredDeviceInstallations();
            }
         }
      };

      this.setTimeRange = function(timeRange) {
         if (timeRange != null) {
            var hasTimeRangeChanged = (currentTimeRange == null || timeRange['min'] != currentTimeRange['min'] || timeRange['max'] != currentTimeRange['max']);
            var hasTimeCursorChanged = (currentTimeRange == null || timeRange['cursorPosition'] != currentTimeRange['cursorPosition']);
            currentTimeRange = timeRange;
            if (hasTimeRangeChanged) {
               // update the set of installations filtered by time
               deviceInstallationsFilteredByTime = {};
               numDeviceInstallationsFilteredByTime = 0;
               for (var i = 0; i < deviceInstallations.length; i++) {
                  var deviceInstallation = deviceInstallations[i];
                  var installation = deviceInstallation['installation'];
                  var installationStartTime = installation['time_range']['start_time_secs'];
                  var installationEndTime = installation['time_range']['end_time_secs'];

                  // Handle case of an ongoing installation.  In that case, the end
                  // time is null, so just use the current time.
                  if (installationEndTime == null) {
                     installationEndTime = new Date().getTime() / 1000;
                  }

                  if (!((installationStartTime < currentTimeRange['min'] &&
                         installationEndTime < currentTimeRange['min'] )
                        ||
                        (currentTimeRange['max'] < installationStartTime &&
                         currentTimeRange['max'] < installationEndTime ))) {
                     deviceInstallationsFilteredByTime[installation['id']] = deviceInstallation;
                     numDeviceInstallationsFilteredByTime++;
                  }
               }

               updateSetOfFilteredDeviceInstallations();
            }
            else if (hasTimeCursorChanged) {
               // publish event, including the current channel values
               var changeEvent = getChannelValuesOfActiveDeviceInstallations();
               for (var i = 0; i < activeDeviceInstallationChangeListeners.length; i++) {
                  activeDeviceInstallationChangeListeners[i](changeEvent);
               }
            }
         }
      };

      var getChannelValuesOfActiveDeviceInstallations = function() {
         var isDeviceInstallationActive = {};
         var channelValues = {};
         for (var id in filteredDeviceInstallations) {
            var installationTimeRange = filteredDeviceInstallations[id]['installation']['time_range'];
            var startTimeSecs = installationTimeRange['start_time_secs'];
            var endTimeSecs = installationTimeRange['end_time_secs'];
            var isActive = isTimeWithinRange(currentTimeRange['cursorPosition'], startTimeSecs, endTimeSecs);
            isDeviceInstallationActive[id] = isActive;
            if (isActive) {
               channelValues[id] = getValueAtTime(filteredDeviceInstallations[id]['device']['name'], currentChannelName, currentTimeRange['cursorPosition']);
            }
         }
         return {
            "isDeviceInstallationActive" : isDeviceInstallationActive,
            "channelValues" : channelValues
         };
      }

      this.getChannelDatasource = function(deviceName, channelName) {
         return devicesAndChannels[deviceName]['channelsMap'][channelName][DATASOURCE_KEY];
      };

      this.addDeviceInstallationChangeListener = function(listener) {
         if (typeof listener === 'function') {
            deviceInstallationChangeListeners.push(listener);
         }
      }

      this.addActiveDeviceInstallationChangeListener = function(listener) {
         if (typeof listener === 'function') {
            activeDeviceInstallationChangeListeners.push(listener);
         }
      }

      this.addChannelChangeListener = function(listener) {
         if (typeof listener === 'function') {
            channelChangeListeners.push(listener);
         }
      }

      var updateSetOfFilteredDeviceInstallations = function() {
         if (currentLatLongBounds != null && currentTimeRange != null) {
            var newfilteredDeviceInstallations = {};

            // merge the sets (TODO: eventually iterate over the smaller of the two sets)
            var numActive = 0;
            for (var installationId in deviceInstallationsFilteredByLocation) {
               if (installationId in deviceInstallationsFilteredByTime) {
                  newfilteredDeviceInstallations[installationId] = deviceInstallationsFilteredByTime[installationId];
                  numActive++;
               }
            }

            // Now that we have a set of the new active device installations, compare it with the old set,
            // keeping track of which ones have been added
            var numAdded = 0;
            var addedDeviceInstallations = {};
            for (var newActiveId in newfilteredDeviceInstallations) {
               if (!(newActiveId in filteredDeviceInstallations)) {
                  addedDeviceInstallations[newActiveId] = newfilteredDeviceInstallations[newActiveId];
                  numAdded++;
               }
            }

            // Now iterate over the old set, comparing it with the new to determine which have been removed
            var removedDeviceInstallationIds = [];
            for (var id in filteredDeviceInstallations) {
               if (!(id in newfilteredDeviceInstallations)) {
                  removedDeviceInstallationIds.push(id);
               }
            }

            filteredDeviceInstallations = newfilteredDeviceInstallations;

            // Finally, iterate over the set of addedDeviceInstallations and separate them
            // based on whether the current time range's cursor falls within the installation's
            // time range
            var addedActiveDeviceInstallations = {};
            var addedInactiveDeviceInstallations = {};
            for (var id in addedDeviceInstallations) {
               var deviceInstallation = addedDeviceInstallations[id];
               var startTimeSecs = deviceInstallation['installation']['time_range']['start_time_secs'];
               var endTimeSecs = deviceInstallation['installation']['time_range']['end_time_secs'];
               if (isTimeWithinRange(currentTimeRange['cursorPosition'], startTimeSecs, endTimeSecs)) {
                  addedActiveDeviceInstallations[id] = deviceInstallation;
               }
               else {
                  addedInactiveDeviceInstallations[id] = deviceInstallation;
               }
            }

            //console.log("updateSetOfFilteredDeviceInstallations: location=[" + numDeviceInstallationsFilteredByLocation + "] time=[" + numDeviceInstallationsFilteredByTime + "] active=[" + numActive + "] added=[" + numAdded + "] removed=[" + removedDeviceInstallationIds.length + "]");

            // publish to listeners, but only if added and/or removed is non-zero
            if (numAdded > 0 || removedDeviceInstallationIds.length > 0) {
               var changeEvent = {
                  "addedActive" : addedActiveDeviceInstallations,
                  "addedInactive" : addedInactiveDeviceInstallations,
                  "removedIds" : removedDeviceInstallationIds
               };
               for (var i = 0; i < deviceInstallationChangeListeners.length; i++) {
                  deviceInstallationChangeListeners[i](changeEvent);
               }
            }
         }
      };

      var getValueAtTime = function(deviceName, channelName, timeInSecs) {
         if (isValidTimeForDevice(deviceName, timeInSecs)) {
            return devicesAndChannels[deviceName]['channelsMap'][channelName]['value_function'](timeInSecs);
         }
         return null;
      };

      var createChannelDatasource = function(deviceName, channelName) {
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

            var t = offsetTimeInSecs;
            for (var i = 0; i < 512; i++) {
               // TODO: improve efficiency!
               var value = getValueAtTime(deviceName, channelName, t);
               if (value != null) {
                  json['data'].push([t, value, 0, 0])
               }
               t += sampleWidthInSecs;
            }

            successCallback(JSON.stringify(json));
         };
      };

      var isTimeWithinRange = function(timeInSecs, startTimeSecs, endTimeSecs) {
         if (startTimeSecs <= timeInSecs) {
            if ((endTimeSecs == null && timeInSecs < new Date().getTime() / 1000) || timeInSecs < endTimeSecs) {
               return true;
            }
         }
         return false;
      }

      var isValidTimeForDevice = function(deviceName, timeInSecs) {
         // first, find the device
         var device = findDeviceMetadata(deviceName);
         if (device != null) {
            // now check each of the installations to see whether the time is valid
            var installations = device['installations'];
            for (var i = 0; i < installations.length; i++) {
               var startTimeSecs = installations[i]['time_range']['start_time_secs'];
               var endTimeSecs = installations[i]['time_range']['end_time_secs'];

               if (isTimeWithinRange(timeInSecs, startTimeSecs, endTimeSecs)) {
                  return true;
               }
            }
         }
         return false;
      };

      var findDeviceMetadata = function(deviceName) {
         for (var i = 0; i < DEVICE_METADATA.length; i++) {
            var device = DEVICE_METADATA[i];
            if (device['name'] == deviceName) {
               return device;
            }
         }
         return null;
      };

      var initialize = function() {
         // Build an internal representation of the devices and channels, merged with the metadata
         // TODO: assumes that device names are unique!!!
         for (var i = 0; i < DEVICES_AND_CHANNELS.length; i++) {
            var device = DEVICES_AND_CHANNELS[i];
            var deviceName = device['name'];
            if (!(deviceName in devicesAndChannels)) {
               devicesAndChannels[deviceName] = {};
            }

            devicesAndChannels[deviceName] = device;

            // build a map of the channels for this device
            devicesAndChannels[deviceName]['channelsMap'] = {};
            var channels = device['channels'];
            for (var j = 0; j < channels.length; j++) {
               var channel = channels[j];
               var channelName = channel['name'];
               devicesAndChannels[deviceName]['channelsMap'][channelName] = channel;
               channel[DATASOURCE_KEY] = createChannelDatasource(deviceName, channelName);
            }
         }

         // now build up the device installations
         for (var k = 0; k < DEVICE_METADATA.length; k++) {
            var deviceMetadata = DEVICE_METADATA[k];
            var device = devicesAndChannels[deviceMetadata['name']];
            if (device) {
               var installations = deviceMetadata['installations'];
               for (var m = 0; m < installations.length; m++) {
                  var installation = installations[m];
                  var installationLocation = installation['location'];
                  installationLocation['latLong'] = new google.maps.LatLng(installationLocation['lat'], installationLocation['lon'])

                  // TODO: ideally, these would be sorted by start time so we could binary search it later
                  deviceInstallations.push({
                                              "device" : device,
                                              "installation" : installation
                                           });
               }
            }
         }
      };

      // ==================================================================================================================

      var __now = new Date();
      // two months ago
      var __speck1MinTime = new Date(__now.getFullYear(), __now.getMonth() - 2, __now.getDate(), 0, 0, 0).getTime() / 1000;
      // three months ago
      var __speck2MinTime = new Date(__now.getFullYear(), __now.getMonth() - 3, __now.getDate(), 0, 0, 0).getTime() / 1000;
      // current time, or noon today, whichever is earlier
      var __speck2MaxTime = Math.min(__now.getTime() / 1000, new Date(__now.getFullYear(), __now.getMonth(), __now.getDate(), 12, 0, 0).getTime() / 1000);

      var DEVICE_METADATA = [
         {
            "name" : "Speck1",
            "installations" : [
               {
                  "id" : 1,
                  "time_range" : {
                     // two months ago
                     "start_time_secs" : __speck1MinTime,
                     // one month ago
                     "end_time_secs" : new Date(__now.getFullYear(), __now.getMonth() - 1, __now.getDate(), 0, 0, 0).getTime() / 1000
                  },
                  "location" : {
                     "name" : "Festivus Pole",
                     "lat" : 40.444174,
                     "lon" : -79.942894
                  },
                  // TODO: I'm not married to this, just an idea..
                  "owner" : {
                     "first_name" : "Billy",
                     "last_name" : "Shears",
                     "email" : "beatlesfan@example.com"
                  }
               },
               {
                  "id" : 2,
                  "time_range" : {
                     // seven days ago
                     "start_time_secs" : new Date(__now.getFullYear(), __now.getMonth(), __now.getDate() - 7, 0, 0, 0).getTime() / 1000,
                     // now
                     "end_time_secs" : null
                  },
                  "location" : {
                     "name" : "CMU Fence",
                     "lat" : 40.442321,
                     "lon" : -79.943550
                  }
               }
            ]
         },
         {
            "name" : "Speck2",
            "installations" : [
               {
                  "id" : 3,
                  "time_range" : {
                     "start_time_secs" : __speck2MinTime,
                     "end_time_secs" : __speck2MaxTime
                  },
                  "location" : {
                     "name" : "Garden Outside of CMU CREATE Lab",
                     "lat" : 40.443697,
                     "lon" : -79.946507
                  }
               }
            ]
         }
      ];

      var DEVICES_AND_CHANNELS = [
         {
            "name" : "Speck1",
            "channels" : [
               {
                  "name" : "particles",
                  "min" : 60,
                  "max" : 80,
                  "min_time" : __speck1MinTime,
                  "max_time" : __now,
                  "time_type" : "gmt",
                  "style" : {
                     "styles" : [
                        {"type" : "line", "lineWidth" : 1, "show" : true}
                     ]
                  },
                  "builtin_default_style" : {
                     "styles" : [
                        {"type" : "line", "lineWidth" : 1, "show" : true}
                     ]
                  },
                  "value_function" : function(timeInSecs) {
                     return (Math.sin(timeInSecs * 0.00009) + 1) * 10 + 60; // varies the value between [60,80]
                  }
               },
               {
                  "name" : "temperature",
                  "min" : 0,
                  "max" : 100,
                  "min_time" : __speck1MinTime,
                  "max_time" : __now,
                  "time_type" : "gmt",
                  "style" : {
                     "styles" : [
                        {"type" : "line", "lineWidth" : 1, "show" : true}
                     ]
                  },
                  "builtin_default_style" : {
                     "styles" : [
                        {"type" : "line", "lineWidth" : 1, "show" : true}
                     ]
                  },
                  "value_function" : function(timeInSecs) {
                     return (timeInSecs % 43200) / 43200 * 100; // varies the value between [0,100]
                  }
               }
            ]
         },
         {
            "name" : "Speck2",
            "channels" : [
               {
                  "name" : "particles",
                  "min" : 40,
                  "max" : 60,
                  "min_time" : __speck2MinTime,
                  "max_time" : __speck2MaxTime,
                  "time_type" : "gmt",
                  "style" : {
                     "styles" : [
                        {"type" : "line", "lineWidth" : 1, "show" : true}
                     ]
                  },
                  "builtin_default_style" : {
                     "styles" : [
                        {"type" : "line", "lineWidth" : 1, "show" : true}
                     ]
                  },
                  "value_function" : function(timeInSecs) {
                     return (Math.cos(timeInSecs * 0.00009) + 1) * 10 + 40; // varies the value between [40,60]
                  }
               },
               {
                  "name" : "temperature",
                  "min" : 20,
                  "max" : 70,
                  "min_time" : __speck2MinTime,
                  "max_time" : __speck2MaxTime,
                  "time_type" : "gmt",
                  "style" : {
                     "styles" : [
                        {"type" : "line", "lineWidth" : 1, "show" : true}
                     ]
                  },
                  "builtin_default_style" : {
                     "styles" : [
                        {"type" : "line", "lineWidth" : 1, "show" : true}
                     ]
                  },
                  "value_function" : function(timeInSecs) {
                     return (timeInSecs % 86400) / 86400 * 50 + 20; // varies the value between [20,70]
                  }
               }
            ]
         }
      ];

      initialize();
   };

})();

