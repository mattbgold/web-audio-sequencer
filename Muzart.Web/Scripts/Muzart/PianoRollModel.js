var Muzart;
dp = false;
(function($, Muzart){
    'use strict';
    
	Muzart.PianoRollModel = function(player) {
		var self = this;
		
		var _lastNote = null;
        
		self.load = function (canvas) {
		    _lastNote = canvas.notes.length ? canvas.notes[canvas.notes.length - 1] : null;
		    self.measuresInRoll(canvas.len/self.baseNotesToMakeQuarterNote / 4); //_lastNote ? Math.ceil((_lastNote.on + _lastNote.len) / self.baseNotesToMakeQuarterNote / 4) : 8
		    self.notes(canvas.notes);
		};

		self.player = player;
		self.playRoll = function () {
		    self.player.play(self.notes());
		};

		self.widthOfQuarterNoteAtNoZoom = 10;
		self.baseNotesToMakeQuarterNote = 8; //defines smallest possible note. value of 8 means 32nd note
		//self.bpm = ko.observable(120);
		self.tracks = [];
		self.notes = ko.observableArray([]);
		self.measuresInRoll = ko.observable(8);

		self.gridState = new Muzart.SnapZoomGridModel(self.widthOfQuarterNoteAtNoZoom / self.baseNotesToMakeQuarterNote, 20, 4);
		self.selection = new Muzart.SelectionModel(self.notes);
		
	    //init
		for (var i = 0; i < 88; i++) {
		    self.tracks.push(new Muzart.NoteTrack(i));
		}

		self.snapLengthText = ko.pureComputed(function() {
		    return '1/' + (self.baseNotesToMakeQuarterNote * 4 * self.gridState.gridBaseWidth() / self.gridState.gridSnapWidth())
		});
		

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
			newNote.play();

			self.notes.push(newNote);
			
			//retrigger event to start dragging as soon as note is created
			setTimeout(function(){if(Muzart.inputs.mouseLeft){dp=true;$('.note').last().trigger(event);}}, 100);
		};

		self.noteClicked = function (noteModel, e) {
		    self.removeNote(noteModel, e);
		    if (e.which === 1 && dp === false) {
		        noteModel.play();
		    }
		    dp = false;
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
	};


})(jQuery, Muzart || (Muzart = {}));