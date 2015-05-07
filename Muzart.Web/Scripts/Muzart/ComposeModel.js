var Muzart;

(function($, Muzart){
    'use strict';

    Muzart.ComposeModel = function () {
        var self = this;
        
        self.tracks = ko.observableArray([new Muzart.Track()]);
        self.canvases = ko.observableArray([]);

        self.gridState = new Muzart.SnapZoomGridModel(5, 80);
        self.selection = new Muzart.SelectionModel(self.canvases);

        self.instruments = ['Piano', 'Instrument2', 'Instrument3'];

        //functions
        self.removeTrack = function (track) {
            self.tracks.remove(track);
        };

        self.addTrack = function () {
            self.tracks.push(new Muzart.Track());
        };
        
    };
})(jQuery, Muzart || (Muzart = {}));