var Muzart;

(function($, Muzart){
    'use strict';

	Muzart.PianoRollModel = function(MIDI) {
		var self = this;
		
		self.widthOfQuarterNoteAtNoZoom = 10;
		self.baseNotesToMakeQuarterNote = 8; //defines smallest possible note. value of 8 means 32nd note
		self.loaded = ko.observable(false);
		self.snapMode = ko.observable(2);
		self.gridResolution = ko.pureComputed(function() {
			return Math.pow(2, self.snapMode());
		});
		self.zoomLevel = ko.observable(4);
		self.measuresInRoll = ko.observable(8);
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
		
		var startTime = new Date();
		self.playTime = ko.observable(0.0);
		var updateInterval;
		var updatePlayTime = function () {
		    self.playTime( (new Date() - self.startTime) / 1000);
		};

		self.bpm = ko.observable(120);
		self.tracks = [];
		self.notes = ko.observableArray([]);

		self.selectedNotes = ko.pureComputed(function(){
			return ko.utils.arrayFilter(self.notes(), function(note) {
				return note.isSelected();
			});
		});

		self.copyBuffer = [];


		for(var i=0; i< 88; i++) {
			self.tracks.push(new Muzart.NoteTrack(i));
		}
		
		// functions
		self.trackClicked = function(data, event) {
			if(event.which !== 1 || event.ctrlKey) {
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
		self.actionCursor = ko.pureComputed(function() {
			var cls = '';
			if(inputs.ctrl() && inputs.alt()) {
				return 'is-cursor-subtract';
			}
			else if(inputs.ctrl() && inputs.shift()) {
				return 'is-cursor-add';
			}
			else if(inputs.ctrl()) {
				return 'is-cursor-select';
			}
			else return '';
			
		});

		self.removeNote = function($data, event) {
			if(mouseRight || (event.type === 'mousedown' && event.which ===3)) {
				self.notes.remove($data);
			}
		};
		self.deselectAll = function() {
			$.each(self.notes(), function(i,note) {
				note.isSelected(false);
			});
			return false;
		};
		self.selectAll = function() {
			$.each(self.notes(), function(i,note) {
				note.isSelected(true);
			});
			return false;
		};
		
		self.onBoxSelect = function(x1, x2, y1, y2) {
			var boxedNotes = [];
			$.each(self.notes(), function(i, note) {
				var left = note.on * self.gridBaseWidth();
				var top = note.top*trackHeight;
				var w = note.len * self.gridBaseWidth();
				var h = trackHeight;
				
				//with each note
				if(left < x2 && left+w > x1 && top < y2 && top+h > y1) {
					boxedNotes.push(note);
					//select the ntoe
				}
			});
			
			self.affectSelection(boxedNotes);
		};
		
		self.noteQueue = [];

		self.play = function() {
		    //21 = A0, 108 = Gb7
		    self.stop();
		    self.startTime = new Date();
		    updateInterval = setInterval(updatePlayTime, 20);
			MIDI.setVolume(0, 127);
			ko.utils.arrayForEach(self.notes(), function(note) {
			    self.noteQueue.push(setTimeout(note.play, (note.on/self.bpmScale())*1000));
			});
		};
		
		self.stop = function () {
		    clearInterval(updateInterval);
		    MIDI.stopAllNotes();
		    $.each(self.noteQueue, function (i, val) {
		        clearTimeout(val); 
		    });
		    self.noteQueue = [];
		};
	
		self.togglePlay = function() {
		    if (self.noteQueue.length) {
		        self.stop();
		    }
		    else {
		        self.play();
		    }
			return false;
		}
		
		self.affectSelection = function(notes) {
			//add, remove, notes from selection using inputs to determine
			if (inputs.ctrl() && !inputs.shift() && !inputs.alt()) {
				self.deselectAll();
			}
			$.each(notes, function(i, note) {
				if(inputs.ctrl() && inputs.alt()) {
					note.isSelected(false);
				}
				else if(inputs.ctrl()) {
					note.isSelected(true);
				}
			});
		};

		self.deleteSelection = function() {
			$.each(self.selectedNotes(), function(i, note) {
				self.notes.remove(note);
			});
			return false;
		};

		self.copySelection = function() {
			self.copyBuffer = [];
			$.each(self.selectedNotes(), function(i, note) {
				self.copyBuffer.push(note.clone());
			});
			return false;
		};
		
		self.cutSelection = function() {
			self.copyBuffer = [];
			$.each(self.selectedNotes(), function(i, note) {
				self.copyBuffer.push(note.clone());
			});
			self.deleteSelection();
			return false;
		};
		
		self.pasteSelection = function() {
			self.deselectAll();
			$.each(self.copyBuffer, function(i, note) {
				self.notes.push(note);
				note.isSelected(true);
			});
			self.copySelection(); //refresh the copy buffer with newly cloned instances
			return false;
		};
	};

})(jQuery, Muzart || (Muzart = {}));