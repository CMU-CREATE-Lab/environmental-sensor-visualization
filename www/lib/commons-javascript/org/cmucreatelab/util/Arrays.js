//======================================================================================================================
// A utility class for working with arrays.
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
   org.cmucreatelab.util.Arrays = {};

   org.cmucreatelab.util.Arrays.NUMERIC_COMPARATOR = function(a, b) {
      if (a < b) {
         return -1;
      }
      if (a > b) {
         return 1;
      }
      return 0;
   };

   var NUMERIC_COMPARATOR_FIND_FIRST = function(a, b) {
      if (a < b) {
         return -1;
      }
      if (a >= b) {
         return 1;
      }
      return 0;
   };

   var NUMERIC_COMPARATOR_FIND_LAST = function(a, b) {
      if (a <= b) {
         return -1;
      }
      if (a > b) {
         return 1;
      }
      return 0;
   };

   /**
    * Attempts to find the given needle in the given haystack using the given comparator.  If found, it returns the
    * index of the element; otherwise it returns a negative number which is the complement of the insertion index.
    *
    * Throws a TypeError if:
    * 1) the haystack is undefined, null, or not an array.
    * 2) the needle is undefined
    * 3) the comparator is not a function
    *
    * @param haystack the array to search
    * @param needle the number to find
    * @param comparator the comparator to use
    * @returns {int} If found, it returns the index of the element; otherwise it returns a negative number which is the
    * complement of the insertion index.
    */
   org.cmucreatelab.util.Arrays.binarySearch = function(haystack, needle, comparator) {
      if (typeof haystack === 'undefined' || haystack == null) {
         throw new TypeError("Arrays.binarySearch: first argument cannot be null or undefined");
      }

      // check whether it's an array, or at least looks like one of the various TypedArrays
      if (!Array.isArray(haystack)) {
         if (typeof haystack.buffer !== 'object' ||
             typeof haystack.byteOffset !== 'number' ||
             typeof haystack.length !== 'number') {
            throw new TypeError("Arrays.binarySearch: first argument is not an array 2");
         }
      }

      if (typeof needle === 'undefined') {
         throw new TypeError("Arrays.binarySearch: second argument cannot be undefined");
      }

      if (typeof comparator !== "function") {
         throw new TypeError("Arrays.binarySearch: third argument is not a function");
      }

      var low = 0,
            mid = 0,
            high = haystack.length - 1,
            cmp = 0;

      while (low <= high) {
         /* Note that "(low + high) >>> 1" may overflow, and results in a typecast
          * to double (which gives the wrong results). */
         mid = low + (high - low >> 1);
         cmp = comparator(haystack[mid], needle) | 0;

         /* Too low. */
         if (cmp < 0) {
            low = mid + 1;
         }

         /* Too high. */
         else if (cmp > 0) {
            high = mid - 1;
         }

         /* Key found. */
         else {
            return mid;
         }
      }

      /* Key not found. */
      return ~low;
   };

   /**
    * Attempts to find the index of the first occurrence of the given needle in the given haystack using numerical
    * comparison and assuming that the haystack is sorted in ascending order.  If not found, it returns a negative
    * number which is the complement of the insertion index.
    *
    * Throws a TypeError if:
    * 1) the haystack is undefined, null, or not an array.
    * 2) the needle is undefined
    *
    * @param haystack the array to search
    * @param needle the number to find
    * @returns {int} if needle exists in haystack, the index of the first occurrence; otherwise returns the complement
    * of the insertion index.
    */
   org.cmucreatelab.util.Arrays.binarySearchFindFirst = function(haystack, needle) {
      var index = org.cmucreatelab.util.Arrays.binarySearch(haystack, needle, NUMERIC_COMPARATOR_FIND_FIRST);
      var indexOfNeedleElement = ~index;
      if (haystack[indexOfNeedleElement] == needle) {
         return indexOfNeedleElement;
      }
      return index;
   };

   /**
    * Attempts to find the index of the last occurrence of the given needle in the given haystack using numerical
    * comparison and assuming that the haystack is sorted in ascending order.  If not found, it returns a negative
    * number which is the complement of the insertion index.
    *
    * Throws a TypeError if:
    * 1) the haystack is undefined, null, or not an array.
    * 2) the needle is undefined
    *
    * @param haystack the array to search
    * @param needle the number to find
    * @returns {int} if needle exists in haystack, the index of the last occurrence; otherwise returns the complement
    * of the insertion index.
    */
   org.cmucreatelab.util.Arrays.binarySearchFindLast = function(haystack, needle) {
      var index = org.cmucreatelab.util.Arrays.binarySearch(haystack, needle, NUMERIC_COMPARATOR_FIND_LAST);
      var indexOfNeedleElement = ~index - 1;
      if ((0 <= indexOfNeedleElement) &&
          (indexOfNeedleElement <= haystack.length - 1) &&
          (haystack[indexOfNeedleElement] == needle)) {
         return indexOfNeedleElement;
      }
      return index;
   };

})();

