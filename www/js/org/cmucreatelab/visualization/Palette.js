//======================================================================================================================
//
// Class for rendering palettes and converting values to colors based on the palette.
//
// Supported events:
// * palette-range-change()
//
// Dependencies:
// * jQuery (http://jquery.com/)
// * org.cmucreatelab.events.EventManager.js
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
//======================================================================================================================

//======================================================================================================================
// DEPENDECIES
//======================================================================================================================
if (!window['$']) {
   var nojQueryMsg = "The jQuery library is required by org.bodytrack.datastore.ChannelDatasource.js";
   alert(nojQueryMsg);
   throw new Error(nojQueryMsg);
}
if (!org.cmucreatelab.events.EventManager) {
   var noEventManagerMsg = "The org.cmucreatelab.events.EventManager library is required by org.cmucreatelab.visualization.Palette.js";
   alert(noEventManagerMsg);
   throw new Error(noEventManagerMsg);
}
//======================================================================================================================

//======================================================================================================================
// CODE
//======================================================================================================================
(function() {
   "use strict";

   // Got the divergent palettes from http://colorbrewer2.org/
   var PALETTES = [
      {
         "name" : "Green - Red 5",
         "colors" : ["hsl(120,100%,50%)", "hsl(90,100%,50%)", "hsl(60,100%,50%)", "hsl(30,100%,50%)", "hsl(0,100%,50%)"]
      },
      {
         "name" : "Green - Red 7",
         "colors" : ["hsl(120,100%,50%)", "hsl(100,100%,50%)", "hsl(80,100%,50%)", "hsl(60,100%,50%)", "hsl(40,100%,50%)", "hsl(20,100%,50%)", "hsl(0,100%,50%)"]
      },
      {
         "name" : "Green - Red 9",
         "colors" : ["hsl(120,100%,50%)", "hsl(105,100%,50%)", "hsl(90,100%,50%)", "hsl(75,100%,50%)", "hsl(60,100%,50%)", "hsl(45,100%,50%)", "hsl(30,100%,50%)", "hsl(15,100%,50%)", "hsl(0,100%,50%)"]
      },
      {
         "name" : "Green - Red 11",
         "colors" : ["hsl(120,100%,50%)", "hsl(108,100%,50%)", "hsl(96,100%,50%)", "hsl(84,100%,50%)", "hsl(72,100%,50%)", "hsl(60,100%,50%)", "hsl(48,100%,50%)", "hsl(36,100%,50%)", "hsl(24,100%,50%)", "hsl(12,100%,50%)", "hsl(0,100%,50%)"]
      },
      {
         "name" : "Divergent 5",
         "colors" : ["#1a9641", "#a6d96a", "#ffffbf", "#fdae61", "#d7191c"]
      },
      {
         "name" : "Divergent 7",
         "colors" : ["#1a9850", "#91cf60", "#d9ef8b", "#ffffbf", "#fee08b", "#fc8d59", "#d73027"]
      },
      {
         "name" : "Divergent 9",
         "colors" : ["#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d73027"]
      },
      {
         "name" : "Divergent 11",
         "colors" : [ "#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d73027", "#a50026" ]
      },
      {
         "name" : "Divergent 5 (Colorblind Safe)",
         "colors" : ["#2c7bb6", "#abd9e9", "#ffffbf", "#fdae61", "#d7191c"]
      },
      {
         "name" : "Divergent 7 (Colorblind Safe)",
         "colors" : ["#4575b4", "#91bfdb", "#e0f3f8", "#ffffbf", "#fee090", "#fc8d59", "#d73027"]
      },
      {
         "name" : "Divergent 9 (Colorblind Safe)",
         "colors" : ["#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027"]
      },
      {
         "name" : "Divergent 11 (Colorblind Safe)",
         "colors" : ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]
      }
   ];

   org.cmucreatelab.visualization.Palette = function(minValue, maxValue, paletteIndexOrNameOrColorsArray) {
      var eventManager = new org.cmucreatelab.events.EventManager();

      var colors = null;

      // The "constructor"
      (function() {
         if (maxValue <= minValue) {
            throw "IllegalArgumentException: minValue must be strictly less than maxValue";
         }

         if ($.type(paletteIndexOrNameOrColorsArray) === "number" || $.isNumeric(paletteIndexOrNameOrColorsArray)) {
            if (0 <= paletteIndexOrNameOrColorsArray && paletteIndexOrNameOrColorsArray < PALETTES.length) {
               colors = PALETTES[paletteIndexOrNameOrColorsArray]['colors'];
            }
            else {
               throw "IllegalArgumentException: invalid palette index [" + paletteIndexOrNameOrColorsArray + "]"
            }
         }
         else if ($.type(paletteIndexOrNameOrColorsArray) === "string") {
            for (var i = 0; i < PALETTES.length; i++) {
               if (PALETTES[i]['name'] === paletteIndexOrNameOrColorsArray) {
                  colors = PALETTES[i]['colors'];
                  break;
               }
            }
            if (colors == null) {
               throw "IllegalArgumentException: unknown palette name [" + paletteIndexOrNameOrColorsArray + "]"
            }
         }
         else if ($.type(paletteIndexOrNameOrColorsArray) === "array") {
            colors = paletteIndexOrNameOrColorsArray;
            if (colors.length <= 0) {
               throw "IllegalArgumentException: the colors array may not be empty"
            }
         }
         else {
            throw "IllegalArgumentException: expecting a palette ID, palette name, or an array of colors"
         }

      })();

      /**
       * Sets the max value for this palette, causing a "palette-range-change" event to be fired.
       */
      this.setMaxValue = function(newValue) {
         maxValue = newValue;
         eventManager.publishEvent('palette-range-change');
      };

      /**
       * Returns the current max value for this palette.
       */
      this.getMaxValue = function() {
         return maxValue;
      };

      /**
       * Sets the min value for this palette, causing a "palette-range-change" event to be fired.
       */
      this.setMinValue = function(newValue) {
         minValue = newValue;
         eventManager.publishEvent('palette-range-change');
      };

      /**
       * Returns the current min value for this palette.
       */
      this.getMinValue = function() {
         return minValue;
      };

      /**
       * Builds a semicolon-delimited string of alternating colors and range bound values which can be used by the
       * BodyTrack Grapher's "strip" plot style.
       */
      this.getRangedColorsString = function() {
         var valueIncrement = ((maxValue - minValue) / colors.length);
         var rangedColors = [];
         $.each(colors, function(index, color) {
            rangedColors.push(color);
            if (index < (colors.length - 1)) {
               var val = minValue + (valueIncrement * (index + 1));
               rangedColors.push(val);
            }
         });

         return rangedColors.join(";");
      };

      /**
       * Returns the color corresponding to the given value.  The value is clamped to the
       * range [minValue, maxValue] first.
       */
      this.getColorForValue = function(value) {
         // clamp the value to be within the allowed range
         var clampedValue = Math.min(Math.max(value, minValue), maxValue);

         var numBuckets = colors.length;
         var percentage = (clampedValue - minValue) / (maxValue - minValue);   // convert to [0,1]
         var colorIndex = Math.max(0, Math.ceil(percentage * numBuckets) - 1);
         return colors[colorIndex];
      };

      /**
       * Renders the palette to the canvas specified by the given DOM element ID.
       */
      this.renderToCanvas = function(canvasElementId) {
         var paletteCanvas = $("#" + canvasElementId);
         var pixelWidth = paletteCanvas.width();
         var pixelHeight = paletteCanvas.height();
         var paletteCanvasContext = paletteCanvas.get(0).getContext("2d");
         paletteCanvasContext.scale(1, 1);
         paletteCanvasContext.clearRect(0, 0, pixelWidth, pixelHeight);

         for (var x = 0; x <= pixelWidth; x = x + 1) {
            var percentage = x / pixelWidth;
            var value = percentage * (maxValue - minValue) + minValue;
            var color = this.getColorForValue(value);
            paletteCanvasContext.lineWidth = 1;
            paletteCanvasContext.strokeStyle = color;
            paletteCanvasContext.beginPath();
            paletteCanvasContext.moveTo(x - 0.5, 0);
            paletteCanvasContext.lineTo(x - 0.5, pixelHeight);
            paletteCanvasContext.stroke();
         }
      };

      this.addEventListener = eventManager.addEventListener;
      this.removeEventListener = eventManager.removeEventListener;
   };

   /**
    * Creates an HTML select menu containing all the palettes.  The value of each option is the palette's ID and
    * can be used to create a new Palette instance.
    */
   org.cmucreatelab.visualization.Palette.createSelectMenu = function(elementId, nameOfSelectedPalette) {
      nameOfSelectedPalette = (typeof nameOfSelectedPalette === 'undefined') ? "" : nameOfSelectedPalette;
      var selectMenu = $('<select id="' + elementId + '"></select>');
      $.each(PALETTES, function(index, palette) {
         var paletteName = palette['name'];
         var selectedClause = (nameOfSelectedPalette === paletteName) ? 'selected="selected"' : '';
         selectMenu.append('<option value="' + index + '" ' + selectedClause + '>' + paletteName + '</option>');
      });
      return selectMenu;
   };

})();
