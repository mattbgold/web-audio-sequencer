var Muzart;

(function(MIDI, Muzart){
	'use strict';

	Muzart.PianoRollModel = function() {
		var self = this;
		
		self.widthOfQuarterNoteAtNoZoom = 10;
		self.baseNotesToMakeQuarterNote = 8; //defines smallest possible note. value of 8 means 32nd note
		self.loaded = ko.observable(false);
		self.snapMode = ko.observable(2);
		self.gridResolution = ko.pureComputed(function() {
			return Math.pow(2, self.snapMode());
		});
		self.zoomLevel = ko.observable(4);
		
		//current width in pixels of smallest possible note
		self.gridBaseWidth = ko.pureComputed(function(){
			var widthOfBaseNote = self.widthOfQuarterNoteAtNoZoom/self.baseNotesToMakeQuarterNote;
			return widthOfBaseNote*Math.pow(2, self.zoomLevel()-1);
		});
		
		self.gridSnapWidth = ko.pureComputed(function() {
			return self.gridResolution()*self.gridBaseWidth();
		});
		
		self.snapLengthText = ko.pureComputed(function() {
			return '1/'+(self.baseNotesToMakeQuarterNote*4*self.gridBaseWidth()/self.gridSnapWidth())
		});
		
		self.bpmScale = ko.pureComputed(function() {
			var bps = (self.bpm()/60); //quarter notes per second
			return bps*self.baseNotesToMakeQuarterNote; // base notes per second
		});
		
		self.bpm = ko.observable(120);
		self.tracks = [];
		self.notes = ko.observableArray([]);

		for(var i=0; i< 88; i++) {
			self.tracks.push(new Muzart.Track(i));
		}
		
		// functions
		self.trackClicked = function(data, event) {
			if(event.which !== 1) {
				return false;
			}
			var $track = $(event.target);
			var offset = $track.offset();
			var trackClickX = event.clientX - offset.left;
			var trackXSnap = (Math.floor(trackClickX / self.gridSnapWidth())*self.gridSnapWidth())/self.gridBaseWidth();

			var newNote = new Muzart.Note(data.num, trackXSnap, self.gridResolution());
			newNote.play(true);
			self.notes.push(newNote);
			
			//retrigger event to start dragging as soon as note is created
			setTimeout(function(){if(mouseLeft){dp=true;$('.note').last().trigger(event);}}, 100);
		};

		self.trackZoomClass = ko.pureComputed(function() {
			return 'track-' + self.zoomLevel();
		});
		
		self.removeNote = function($data, event) {
			if(mouseRight || (event.type === 'mousedown' && event.which ===3)) {
				self.notes.remove($data);
			}
		};
		
		self.play = function() {
			//21 = A0, 108 = Gb7
			var velocity = 127; // how hard the note hits
			MIDI.setVolume(0, 127);
			ko.utils.arrayForEach(self.notes(), function(note) {
				note.play();
			});
		};
		
		self.stop = function() {
			MIDI.stopAllNotes();
		};
	};

})(MIDI, Muzart || (Muzart = {}));