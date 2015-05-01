var Muzart;

(function(MIDI, Muzart){
	'use strict';

    //TODO: should we give each object its own "play" function? play a composition to play all tracks. play a track to solo, etc... chain of responsibility?
    //TODO: should we introduce a separate Timer/Player object which is used by other objects to keep time, manage playhead, handle playing/stopping?
	Muzart.Composition = function () {
	    var self = this;

	    self.tracks = [];
	    self.shelf = null; //a special track for saving canvases not in the composition
	    self.snapWidth = 1; //snap width of canvases. 
	};

	Muzart.Track = function () {
	    var self = this;

	    self.canvases = [];
	    self.instrument = null;
	    self.sequenceNumber = 0;
	    self.mute = false;
	    self.solo = false;
	    self.volume = 1;
	};

	Muzart.Canvas = function () {
	    var self = this;

	    self.notes = [];
	    self.x = 0; //starting point in base notes. 
	    self.length = 0; //length in base notes. if < notes in canvas, extra notes are not played but are remembered. 
	    self.loopAmount = 1; //1 is no loop. Loop amount is a multiplier floating point;
	    //should automation belong to canvas?

        //open piano roll from canvas
	};

	Muzart.NoteTrack = function(num) {
		var self = this;
		
		self.num = num;
		self.noteText = function(){
			return MIDI.noteToKey[108-self.num];
		};
	};

	Muzart.Note = function(top, on, len, vel) {
		var self = this;
		
		self.on = on;
		self.len = len;
		self.top = top;
		self.vel = vel || 127;
		self.prevTop = null;
		
		self.isSelected = ko.observable(false);

		self.clone = function() {
			var note = new Muzart.Note(self.top, self.on, self.len, self.vel);
			note.prevTop = self.prevTop;
			note.isSelected(self.isSelected());
			return note;
		};

//TODO: move this function outta here or pass in the bpmScale reference
// Oooor, make it only possible to play note now, and move the timing into my code.
		self.play = function(preview) {
			MIDI.noteOn(0, (108 - self.top), self.vel, 0);
			MIDI.noteOff(0, (108 - self.top), preview ? .1 : (self.len)/viewModel.bpmScale());
		};
	};

})(MIDI, Muzart || (Muzart = {}));