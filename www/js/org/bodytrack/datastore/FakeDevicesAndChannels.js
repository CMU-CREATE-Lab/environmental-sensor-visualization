var __now = new Date();
var __today = new Date(__now.getFullYear(), __now.getMonth(), __now.getDate(), 0, 0, 0).getTime() / 1000;
var __tomorrow = new Date(__now.getFullYear(), __now.getMonth(), __now.getDate() + 1, 0, 0, 0).getTime() / 1000;

var FAKE_DEVICES_AND_CHANNELS = [
   {
      "name" : "Speck1",
      "channels" : [
         {
            "name" : "particles",
            "min" : 60,
            "max" : 80,
            "min_time" : __today,
            "max_time" : __tomorrow,
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
            "valueFunction" : function(timeInSecs) {
               return (Math.sin(timeInSecs * 0.00009) + 1) * 10 + 60; // varies the value between [60,80]
            }
         },
         {
            "name" : "temperature",
            "min" : 0,
            "max" : 100,
            "min_time" : __today,
            "max_time" : __tomorrow,
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
            "valueFunction" : function(timeInSecs) {
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
            "min_time" : __today,
            "max_time" : __tomorrow,
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
            "valueFunction" : function(timeInSecs) {
               return (Math.cos(timeInSecs * 0.00009) + 1) * 10 + 40; // varies the value between [40,60]
            }
         },
         {
            "name" : "temperature",
            "min" : 20,
            "max" : 70,
            "min_time" : __today,
            "max_time" : __tomorrow,
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
            "valueFunction" : function(timeInSecs) {
               return (timeInSecs % 86400) / 86400 * 50 + 20; // varies the value between [20,70]
            }
         }
      ]
   }
];