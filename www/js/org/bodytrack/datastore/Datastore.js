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
   var noChannelDatasourceMsg = "The org.bodytrack.datastore.ChannelDatasource library is required by org.bodytrack.datastore.Datastore.js";
   alert(noChannelDatasourceMsg);
   throw new Error(noChannelDatasourceMsg);
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.bodytrack.datastore.Datastore = function(host, userId) {

      // make sure the host name doesn't end with a slash
      if (host.lastIndexOf("/") == host.length - 1) {
         host = host.substr(0, host.length - 1);
      }

      this.createChannelDatasource = function(deviceName, channelName) {
         return new org.bodytrack.datastore.ChannelDatasource(host, userId, deviceName, channelName);
      };

      // TODO: add methods for doing things like getting the value at a particular time for one or more channels
   };
})();

