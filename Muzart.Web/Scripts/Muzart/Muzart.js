var Muzart;

(function(MIDI, Muzart){
    'use strict';

    Muzart.inputs = {
        ctrl: ko.observable(false),
        shift: ko.observable(false),
        alt: ko.observable(false),
        mouseRight: false,
        mouseLeft: false
    };

    var Selectable = function (getX, getY, getWidth, getHeight) {
        var self = this;

        self.getX = getX;
        self.getY = getY;
        self.getW = getWidth;
        self.getH = getHeight;

        self.isSelected = ko.observable(false);
        self.clone = self.clone || function () {
            alert('Clone not implemented!');
        }
    };

    //TODO: should we give each object its own "play" function? play a composition to play all tracks. play a track to solo, etc... chain of responsibility?
    //TODO: should we introduce a separate Timer/Player object which is used by other objects to keep time, manage playhead, handle playing/stopping?

    Muzart.Track = function () {
        var self = this;

        self.instrument = ko.observable();
        self.sequenceNumber = 0;
        self.mute = ko.observable(false);
        self.solo = ko.observable(false);
        self.volume = ko.observable(1);
    };

    Muzart.Canvas = function (top, on, len) {
        var self = this;
	    
        self.notes = [];
        self.on = on || 0; //starting point in base notes. 
	    self.loopAmount = 1; //1 is no loop. Loop amount is a multiplier floating point;
	    self.top = top || 0; //determines which track we are in
	    self.len = len || 4;
        self.prevTop = null;

        //open piano roll from canvas
        self.clone = function () {
            var clone = new Muzart.Canvas(self.top, self.on, self.len);
            clone.prevTop = self.prevTop;
            clone.isSelected(self.isSelected());
            var clonedNotes = [];
            for (var note in self.notes) {
                clonedNotes.push(note.clone());
            }
            clone.notes = clonedNotes;

            return clone;
        };

        var getX = function () { return self.on * viewModel.gridState.gridBaseWidth(); };
        var getY = function () { return self.top * viewModel.gridState.rowHeight(); };
        var getW = function () { return self.len * viewModel.gridState.gridBaseWidth(); };
        var getH = function () { return viewModel.gridState.rowHeight(); };
        Selectable.call(self, getX, getY, getW, getH);
	};

	Muzart.NoteTrack = function(num) {
		var self = this;
		
		self.num = num;
		self.noteText = function () {
		    return MIDI.noteToKey[108 - self.num];
		};
	};

	Muzart.Note = function(top, on, len, vel) {
	    var self = this;
		
		self.on = on;
		self.len = len;
		self.top = top;
		self.vel = vel || 127;
		self.prevTop = null;
		
		self.clone = function() {
		    var note = new Muzart.Note(self.top, self.on, self.len, self.vel);
		    note.prevTop = self.prevTop;
		    note.isSelected(self.isSelected());
		    return note;
		};

        //TODO: get rid of all references to viewModel
		self.play = function () {
		    MIDI.noteOn(0, (108 - self.top), self.vel, 0);
		    MIDI.noteOff(0, (108 - self.top), .1);
		}

		var getX = function () { return self.on * viewModel.pianoRoll.gridState.gridBaseWidth(); };
		var getY = function () { return self.top * viewModel.pianoRoll.gridState.rowHeight(); };
		var getW = function () { return self.len * viewModel.pianoRoll.gridState.gridBaseWidth(); };
		var getH = function () { return viewModel.pianoRoll.gridState.rowHeight(); };

		Selectable.call(self, getX, getY, getW, getH);
	};
})(MIDI, Muzart || (Muzart = {}));