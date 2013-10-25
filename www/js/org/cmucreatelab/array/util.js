// Got this from https://github.com/darkskyapp/binary-search/blob/master/index.js which is an implementation
// based on the Java version in Joshua Bloch's article "Nearly All Binary Searches and Merge Sorts are Broken"
// See: http://googleresearch.blogspot.com/2006/06/extra-extra-read-all-about-it-nearly.html
var binarySearch = function(haystack, needle, comparator) {
   // TODO: make the type checking work for typed arrays
   //if (!Array.isArray(haystack)) {
   //   throw new TypeError("first argument to binary search is not an array");
   //}

   if (typeof comparator !== "function") {
      throw new TypeError("third argument to binary search is not a function");
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
}
