var Muzart;

(function($, Muzart){
    'use strict';

    Muzart.ComposeModel = function () {
        var self = this;
        
        self.tracks = ko.observableArray([new Muzart.Track()]);
        self.canvases = ko.observableArray([new Muzart.Canvas(0,0,32*4)]);

        /*self.getAllNotes = function () {
            return [].concat(
                $.map(self.canvases(), function (c, i) {
                    return c.notes;
                })
            );
        };*/

        self.gridState = new Muzart.SnapZoomGridModel(.15625, 70, 4, 4);
        self.canvasSelection = new Muzart.SelectionModel(self.canvases);
        self.selection = self.canvasSelection;
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
                if (self.loadedCanvas()) {
                    self.player.play([self.loadedCanvas()], true);
                }
                else {
                    self.player.play(self.canvases);
                }
            }
        }

        //TODO: move this into the selectGridElement
        self.trackClicked = function (data, event) {
            if (event.which !== 1 || event.ctrlKey) {
                return false;
            }
            var $track = $(event.target);
            var offset = $track.offset();
            var trackClickX = event.clientX - offset.left;
            var trackXSnap = (Math.floor(trackClickX / self.gridState.gridSnapWidth()) * self.gridState.gridSnapWidth()) / self.gridState.gridBaseWidth();

            var newCanvas = new Muzart.Canvas(data.num, trackXSnap, self.gridState.gridResolution()*4);
            //newNote.play();

            self.canvases.push(newCanvas);

            //retrigger event to start dragging as soon as note is created
            setTimeout(function () { if (Muzart.inputs.mouseLeft) { dp = true; $('.canvas').last().trigger(event); } }, 100);
        };

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
                self.selection.deselectAll();
                self.selection = self.pianoRoll.selection;
                self.showPianoRoll(true);
                self.loadedCanvas().notesToDraw(null);
            }
            else {
                self.selection.deselectAll();
                self.selection = self.canvasSelection;
                self.showPianoRoll(false);
            }
        });

        self.saveRoll = function () {
            self.loadedCanvas().notesToDraw(self.loadedCanvas().notes);
            self.loadedCanvas(null);
            
        };

        self.selectAll = function () {
            self.selection.selectAll();
        };
        self.deselectAll = function () {
            self.selection.deselectAll();
        };
        self.deleteSelection = function () {
            self.selection.deleteSelection();
        };
        self.copySelection = function () {
            self.selection.copySelection();
        };
        self.cutSelection = function () {
            self.selection.cutSelection();
        };
        self.pasteSelection = function () {
            self.selection.pasteSelection();
        };
    };
})(jQuery, Muzart || (Muzart = {}));