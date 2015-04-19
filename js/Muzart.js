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

	Muzart.Note = function(top, on, len) {
		var self = this;
		
		self.on = on;
		self.len = len;
		self.top = top;
		self.prevTop = null;
		
		self.isSelected = ko.observable(false);

//TODO: move this function outta here or pass in the bpmScale reference
// Oooor, make it only possible to play note now, and move the timing into my code.
		self.play = function(playNow) {
			var velocity = 127;
			MIDI.noteOn(0, (108 - self.top), velocity, playNow ? 0 : self.on/viewModel.bpmScale());
			MIDI.noteOff(0, (108 - self.top), playNow ? .1 : (self.on + self.len)/viewModel.bpmScale());
		};
	};

})(MIDI, Muzart || (Muzart = {}));