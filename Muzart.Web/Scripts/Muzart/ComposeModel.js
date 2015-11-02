var Muzart;

(function ($, Muzart) {
    'use strict';

    Muzart.ComposeModel = function () {
        var self = this;

        self.tracks = ko.observableArray([new Muzart.Track(0)]);
        self.canvases = ko.observableArray([new Muzart.Canvas(0, 0, 32 * 4)]);
        self.trackHeight = 70;
        self.gridState = new Muzart.SnapZoomGridModel(.15625, self.trackHeight, 4, 4);
        self.canvasSelection = new Muzart.SelectionModel(self.canvases);
        self.selection = self.canvasSelection;
        self.pianoRoll = new Muzart.PianoRollModel();
        self.player = new Muzart.PlayerModel(self.tracks, self.pianoRoll);


        self.instruments = ['Piano', 'Instrument2', 'Instrument3'];

        //state
        self.midiLoaded = ko.observable(false);
        self.midiFiles = ko.observableArray([]);
        self.selectedMidiFile = ko.observable();
        self.getMidiFileId = function (fileName) {
            for (var i = 0; i < self.midiFiles().length; i++) {
                if (self.midiFiles()[i] === fileName) {
                    return i;
                }
            }
            return -1;
        };

        self.snapLengthText = ko.pureComputed(function () {
            return '1/' + (32 * self.gridState.gridBaseWidth() / self.gridState.gridSnapWidth())
        });

        //functions
        self.getCanvasesInTrack = function (track) {
            return $.grep(self.canvases(), function (c, i) {
                return c.top === track.sequenceNumber;
            });
        };

        self.removeTrack = function (track) {
            var canvases = self.getCanvasesInTrack(track);
            $.each(canvases, function (i, can) {
                self.canvases.remove(can);
            });

            var num = track.sequenceNumber;
            self.tracks.remove(track);
            for (var i = num; i < self.tracks().length; i++) {
                var canvases = self.getCanvasesInTrack(self.tracks()[i]);
                $.each(canvases, function (i, can) {
                    can.top -= 1;
                    $(can.element).css('top', '-=' + self.trackHeight + 'px');
                });

                self.tracks()[i].sequenceNumber--;
            }
        };

        self.addTrack = function () {
            self.tracks.push(new Muzart.Track(self.tracks().length));
        };

        self.playToggle = function () {
            if (self.player.isPlaying()) {
                self.player.pause();
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

            var newCanvas = new Muzart.Canvas(data.sequenceNumber, trackXSnap, self.gridState.gridResolution() * 4);
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
                self.player.stop();
            }
            else {
                self.selection.deselectAll();
                self.selection = self.canvasSelection;
                self.showPianoRoll(false);
                self.player.stop();
            }
        });

        self.saveRoll = function () {
            self.loadedCanvas().notesToDraw(self.loadedCanvas().notes);
            self.loadedCanvas(null);

        };

        //we can bind these functions allowing the selection reference in the inner function to vary after bind time
        self.selectAll = function (element) {
            self.selection.selectAll(element);
        };
        self.deselectAll = function (element) {
            self.selection.deselectAll(element);
        };
        self.deleteSelection = function (element) {
            self.selection.deleteSelection(element);
        };
        self.copySelection = function (element) {
            self.selection.copySelection(element);
        };
        self.cutSelection = function (element) {
            self.selection.cutSelection(element);
        };
        self.pasteSelection = function () {
            self.selection.pasteSelection();
        };
        self.selectionExists = function () {
            return self.selection.selectionExists();
        };
        self.canPaste = function () {
            return self.selection.canPaste();
        };


        self.selectedElementActions = [
            { icon: 'fa-trash', text: 'Delete Selection', hotkeys: ['Delete, Backspace'], handler: self.deleteSelection, enableWhen: self.selectionExists },
            { icon: 'fa-copy', text: 'Copy Selection', hotkeys: ['Ctrl+C'], handler: self.copySelection, enableWhen: self.selectionExists },
            { icon: 'fa-cut', text: 'Cut Selection', hotkeys: ['Ctrl+X'], handler: self.cutSelection, enableWhen: self.selectionExists },
            { icon: 'fa-paste', text: 'Paste', hotkeys: ['Ctrl+V'], handler: self.pasteSelection, enableWhen: self.canPaste }
        ];

        self.unselectedElementActions = [
            { icon: 'fa-trash', text: 'Delete', hotkeys: ['Ctrl+RightClick'], passElement: true, handler: self.deleteSelection },
            { icon: 'fa-copy', text: 'Copy', hotkeys: [], passElement: true, handler: self.copySelection },
            { icon: 'fa-cut', text: 'Cut', hotkeys: [], passElement: true, handler: self.cutSelection },
            { icon: 'fa-paste', text: 'Paste', hotkeys: ['Ctrl+V'], handler: self.pasteSelection, enableWhen: self.canPaste }
        ];

        self.gridSelectionActions = [
            { icon: 'fa-plus-square', text: 'Select All', hotkeys: ['Ctrl+A'], handler: self.selectAll },
            { icon: 'fa-minus-square', text: 'Deselect All', hotkeys: ['Ctrl+D'], handler: self.deselectAll }
        ];
        self.elementSelectionActions = [
            { icon: 'fa-plus-square-o', text: 'Add to Selection', hotkeys: ['Ctrl+Shift+Click'], passElement: true, handler: self.selectAll },
            { icon: 'fa-minus-square-o', text: 'Remove From Selection', hotkeys: ['Ctrl+Alt+Click'], passElement: true, handler: self.deselectAll }
        ];

        self.getElementActions = function ($data) {
            return $data.isSelected() ? self.selectedElementActions.concat(self.elementSelectionActions) : self.unselectedElementActions.concat(self.elementSelectionActions);
        };
        self.getGridActions = function () {
            return self.selectedElementActions.concat(self.gridSelectionActions);
        };
    };
})(jQuery, Muzart || (Muzart = {}));