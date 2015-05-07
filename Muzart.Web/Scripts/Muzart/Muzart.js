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

	Muzart.Canvas = function () {
	    var self = this;
	    
	    self.notes = [];
	    self.x = 0; //starting point in base notes. 
	    self.length = 0; //length in base notes. if < notes in canvas, extra notes are not played but are remembered. 
	    self.loopAmount = 1; //1 is no loop. Loop amount is a multiplier floating point;
	    self.trackNum = 0;
	    //should automation belong to canvas?

	    //open piano roll from canvas
	    var f = function(){alert('x/y/w/h not implemented');};
	    Selectable.call(self, f, f, f, f);
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
		self.play = function (preview) {
		    MIDI.noteOn(0, (108 - self.top), self.vel, 0);
		    MIDI.noteOff(0, (108 - self.top), preview ? .1 : (self.len) / viewModel.bpmScale());
		}

		var getX = function () { return self.on * viewModel.gridState.gridBaseWidth(); };
		var getY = function () { return self.top * viewModel.gridState.rowHeight(); };
		var getW = function () { return self.len * viewModel.gridState.gridBaseWidth(); };
		var getH = function () { return viewModel.gridState.rowHeight(); };

		Selectable.call(self, getX, getY, getW, getH);
	};
})(MIDI, Muzart || (Muzart = {}));