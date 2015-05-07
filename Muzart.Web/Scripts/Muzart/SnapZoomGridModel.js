var Muzart;

(function ($, Muzart) {
    'use strict';

    //TODO: put all grid related stuff in here, put a reference of this in objects that need it, then use it for the tracks and for the piano roll.
    //TODO: should we move tracks[] and notes[] in here with generic names like rows and elements? If so have Note/Canvas inherit the positioning variables, and Track/NoteTrack inherit the tracknum. 
    Muzart.SnapZoomGridModel = function (baseWidth, baseHeight) {
        var self = this;

        self.rowHeight = ko.observable(baseHeight);
        self.baseUnitWidth = baseWidth; // width of smallest possible snap unit at no zoom. 
        self.snapMode = ko.observable(2);
        self.gridResolution = ko.pureComputed(function () { // how many baseUnits that fit inside of the snap width
            return Math.pow(2, self.snapMode());
        });
        self.zoomLevel = ko.observable(4); // increase zoomLevel to zoom in. 1 is no zoom

        //current width in pixels of smallest possible note
        self.gridBaseWidth = ko.pureComputed(function () {
            return self.baseUnitWidth * Math.pow(2, self.zoomLevel() - 1);
        });

        self.gridSnapWidth = ko.pureComputed(function () {
            return self.gridResolution() * self.gridBaseWidth();
        });

    };
})(jQuery, Muzart || (Muzart = {}));