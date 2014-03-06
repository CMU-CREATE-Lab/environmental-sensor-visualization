//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   org.cmucreatelab.visualization.Devices = function() {

      /**
       * Returns an object containing two fields, <code>min</code> and <code>max</code>, whose values are the min and max
       * times (in seconds) of all the devices contained in this collection.
       *
       * @returns {object} and object containing the collection's min and max times in seconds
       */
      this.getGlobalTimeRange = function() {
         return {min : 0, max : 0};
      };

      /**
       * Iterates over each device in the collection and calls the given <code>callback</code> for each one.  The
       * callback is called with two arguments: the device name and the device itself
       *
       * @param callback
       */
      this.forEach = function(callback) {
      };

      /**
       * Returns the device with the given <code>name</code>, or undefined if no such device exists.
       *
       * @param name the name of the device to find
       * @returns {object} the device with the given name; undefined if no such device exists
       */
      this.findByName = function(name) {
         return {};
      };

      /**
       * Clamps the given time to the interval used by the given device and returns the new time.
       *
       * @param device the device
       * @param t the time in seconds
       * @returns {number} the clamped time in seconds
       */
      this.clampTimeToInterval = function(device, t) {
         return 0;
      };

      /**
       * Returns the device's value at the given time, or null if no value exists at that time.
       *
       * @param device the device
       * @param timeInSecs the time in seconds
       * @returns {number} the value at the given time, or null if no value exists at that time
       */
      this.getValueAtTime = function(device, timeInSecs) {
         return 0;
      }

      /**
       * Returns an object containing the device's nearest previous value to the given time, as well as the time of that
       * value, or null if there is no previous value.
       * @param device the device
       * @param timeInSecs the time in seconds
       * @returns {{time: *, val: number}}
       */
      this.getNearestPreviousValueAtTime = function(device, timeInSecs) {
         return {time: timeInSecs, val: this.getValueAtTime(device, timeInSecs)};
      };

      /**
       * Returns <code>true</code> if the data occurs at a regular interval; <code>false</code> otherwise.
       * @returns {boolean} whether the data occurs at a regular interval
       */
      this.isFixedIntervalData = function() {
         return true;
      };
   };
})();
