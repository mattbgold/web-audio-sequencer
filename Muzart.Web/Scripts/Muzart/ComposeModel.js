var Muzart;

(function($, Muzart){
    'use strict';

    Muzart.ComposeModel = function () {
        var self = this;
        
        self.tracks = ko.observableArray([new Muzart.Track()]);
        self.canvases = ko.observableArray([new Muzart.Canvas(0,0,32*4)]);

        self.getAllNotes = function () {
            return [].concat(
                $.map(self.canvases(), function (c, i) {
                    return c.notes;
                })
            );
        };

        self.gridState = new Muzart.SnapZoomGridModel(.15625, 70, 4, 4);
        self.selection = new Muzart.SelectionModel(self.canvases);
        self.player = new Muzart.PlayerModel();
        self.pianoRoll = new Muzart.PianoRollModel(self.player);

        self.instruments = ['Piano', 'Instrument2', 'Instrument3'];

        //state
        self.midiLoaded = ko.observable(false);

        self.snapLengthText = ko.pureComputed(function () {
            return '1/' + (32 * self.gridState.gridBaseWidth() / self.gridState.gridSnapWidth())
        });
        //functions
        self.removeTrack = function (track) {
            self.tracks.remove(track);
        };

        self.addTrack = function () {
            self.tracks.push(new Muzart.Track());
        };

        self.playToggle = function () {
            if (self.player.isPlaying()) {
                self.player.stop();
            }
            else {
                //self.player.play(self.getAllNotes());
                self.pianoRoll.playRoll();
            }
        }

        self.showPianoRoll = ko.observable(false);
        self.showPianoRoll.subscribe(function (v) {
            if (v) {
                $('#composition').hide();
                $('#rollcomponent').show();
            }
            else {
                $('#composition').show();
                $('#rollcomponent').hide();
            }
        });

        self.loadedCanvas = ko.observable();
        self.loadedCanvas.subscribe(function (canvas) {
            if (canvas) {
                self.pianoRoll.load(canvas);
                self.showPianoRoll(true);
                self.loadedCanvas().notesToDraw(null);
            }
            else {
                self.showPianoRoll(false);
            }
        });

        self.saveRoll = function () {
            //the piano roll should be working off a reference to the canvas notes already, so we dont need to copy notes
            //create svg
            self.loadedCanvas().notesToDraw(self.loadedCanvas().notes);
            self.loadedCanvas(null);
            
        };
    };
})(jQuery, Muzart || (Muzart = {}));