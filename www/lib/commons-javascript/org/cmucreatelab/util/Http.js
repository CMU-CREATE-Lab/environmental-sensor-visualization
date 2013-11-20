//======================================================================================================================
// A utility class for working with HTTP.
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
if (!org.cmucreatelab.util) {
   org.cmucreatelab.util = {};
}
else {
   if (typeof org.cmucreatelab.util != "object") {
      var orgCmucreatelabUtilExistsMessage = "Error: failed to create org.cmucreatelab.util namespace: org.cmucreatelab.util already exists and is not an object";
      alert(orgCmucreatelabUtilExistsMessage);
      throw new Error(orgCmucreatelabUtilExistsMessage);
   }
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.cmucreatelab.util.Http = {};

   /**
    * Loads an array buffer from the given URL.  Once complete, this function will call the given success or failure
    * callback as appropriate.
    *
    * @param url The URL to load
    * @param callbacks an object containing "success" and "failure" keys which map to functions.  The success
    * function is called with the array buffer upon success, and if the returned response is non-null.  The failure
    * function is called with the request status upon failure.
    *
    * This code is based on code from Google's tdl.io.loadArrayBuffer function.
    */
   org.cmucreatelab.util.Http.loadArrayBuffer = function(url, callbacks) {
      if (typeof window.XMLHttpRequest === 'undefined') {
         throw 'XMLHttpRequest is not supported by this browser';
      }
      var request = new XMLHttpRequest();

      // don't even bother checking the response if there are no callbacks defined
      if (callbacks) {
         request.onreadystatechange = function() {
            if (request.readyState == 4) {
               var arrayBuffer = request.response;

               // HTTP reports success with a 200 status. The file protocol reports
               // success with zero. HTTP does not use zero as a status code (they
               // start at 100). See https://developer.mozilla.org/En/Using_XMLHttpRequest
               var success = arrayBuffer && ((request.status == 200) || (request.status == 0));

               if (success) {
                  if (typeof callbacks['success'] === 'function') {
                     callbacks['success'](arrayBuffer);
                  }
               }
               else if (typeof callbacks['failure'] === 'function') {
                  callbacks['failure'](request.status);
               }
            }
         };
      }
      request.open('GET', url, true);
      if (typeof request.responseType === 'undefined') {
         throw 'The XMLHttpRequest implementation in this browser does not support binary files';
      }
      request.responseType = "arraybuffer";
      request.send(null);
   }
})();

