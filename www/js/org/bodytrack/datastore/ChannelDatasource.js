//======================================================================================================================
// Class for creating a datasource function that knows how to fetch tiles from a BodyTrack Datastore.
//
// Dependencies:
// * jQuery (http://jquery.com/)
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
if (!window['$']) {
   var nojQueryMsg = "The jQuery library is required by org.bodytrack.datastore.ChannelDatasource.js";
   alert(nojQueryMsg);
   throw new Error(nojQueryMsg);
}

//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.bodytrack.datastore.ChannelDatasource = function(host, userId, deviceName, channelName) {

      // make sure the host name doesn't end with a slash
      if (host.lastIndexOf("/") == host.length - 1) {
         host = host.substr(0, host.length - 1);
      }

      var urlPrefix = host + "/tiles/" + userId + "/" + deviceName + "." + channelName + "/";

      return function(level, offset, successCallback, failureCallback) {

         var handleFailure = function(jqXHR, textStatus, errorThrown) {
            console.log("loadJson.handleFailure(): FAILURE! errorThrown:" + errorThrown);
            try {
               if (typeof failureCallback === 'function') {
                  failureCallback(errorThrown);
               }
            }
            catch (ex) {
               console.log("loadJson.handleFailure(): FAILURE! ex:" + ex);
            }
         };

         $.ajax(
               {
                  type : 'GET',
                  dataType : 'jsonp',
                  timeout : 3000,
                  cache : true,
                  global : false,
                  url : urlPrefix + level + "." + offset + ".json",
                  success : function(data, textStatus, jqXHR) {
                     try {
                        if (typeof successCallback === 'function') {
                           // send the JSON as a String...
                           successCallback(typeof data === 'string' ? data : JSON.stringify(data));
                        }
                     }
                     catch (ex) {
                        handleFailure(jqXHR, "JSON parse error", ex);
                     }
                  },
                  error : handleFailure
               }
         );
      }
   };
})();

