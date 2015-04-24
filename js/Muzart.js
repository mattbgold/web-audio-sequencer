var Muzart;

(function(MIDI, Muzart){
	'use strict';

	Muzart.Track = function(num) {
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
		self.play = function(playNow) {
			MIDI.noteOn(0, (108 - self.top), self.vel, playNow ? 0 : self.on/viewModel.bpmScale());
			MIDI.noteOff(0, (108 - self.top), playNow ? .1 : (self.on + self.len)/viewModel.bpmScale());
		};
	};

})(MIDI, Muzart || (Muzart = {}));