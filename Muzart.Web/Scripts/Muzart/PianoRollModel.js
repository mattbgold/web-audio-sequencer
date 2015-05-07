var Muzart;

(function($, Muzart){
    'use strict';

    //TODO: remove anything here that is not part of pianoRoll component into ComposeModel
    // this includes most all of the playhead related stuff (playhead could be reused in pianoroll and compose)
    // 
	Muzart.PianoRollModel = function() {
		var self = this;
		

		self.widthOfQuarterNoteAtNoZoom = 10;
		self.baseNotesToMakeQuarterNote = 8; //defines smallest possible note. value of 8 means 32nd note
		self.loaded = ko.observable(false);
		self.bpm = ko.observable(120);
		self.tracks = [];
		self.notes = ko.observableArray([]);
		self.measuresInRoll = ko.observable(8);

		self.gridState = new Muzart.SnapZoomGridModel(self.widthOfQuarterNoteAtNoZoom / self.baseNotesToMakeQuarterNote, 20);
		self.selection = new Muzart.SelectionModel(self.notes);
		
	    //init
		for (var i = 0; i < 88; i++) {
		    self.tracks.push(new Muzart.NoteTrack(i));
		}

		self.snapLengthText = ko.pureComputed(function() {
		    return '1/' + (self.baseNotesToMakeQuarterNote * 4 * self.gridState.gridBaseWidth() / self.gridState.gridSnapWidth())
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


		// functions
		self.trackClicked = function(data, event) {
			if(event.which !== 1 || event.ctrlKey) {
				return false;
			}
			var $track = $(event.target);
			var offset = $track.offset();
			var trackClickX = event.clientX - offset.left;
			var trackXSnap = (Math.floor(trackClickX / self.gridState.gridSnapWidth()) * self.gridState.gridSnapWidth()) / self.gridState.gridBaseWidth();

			var newNote = new Muzart.Note(data.num, trackXSnap, self.gridState.gridResolution());
			newNote.play(true);

			self.notes.push(newNote);
			
			//retrigger event to start dragging as soon as note is created
			setTimeout(function(){if(Muzart.inputs.mouseLeft){dp=true;$('.note').last().trigger(event);}}, 100);
		};

		self.trackZoomClass = ko.pureComputed(function() {
		    return 'track-' + self.gridState.zoomLevel();
		});
		self.actionCursor = ko.pureComputed(function() {
			var cls = '';
			if (Muzart.inputs.ctrl() && Muzart.inputs.alt()) {
				return 'is-cursor-subtract';
			}
			else if(Muzart.inputs.ctrl() && Muzart.inputs.shift()) {
				return 'is-cursor-add';
			}
			else if(Muzart.inputs.ctrl()) {
				return 'is-cursor-select';
			}
			else return '';
			
		});

		self.removeNote = function($data, event) {
			if(Muzart.inputs.mouseRight || (event.type === 'mousedown' && event.which ===3)) {
				self.notes.remove($data);
			}
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
	};


})(jQuery, Muzart || (Muzart = {}));