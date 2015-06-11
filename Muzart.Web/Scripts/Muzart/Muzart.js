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

    Muzart.Track = function (sequenceNum) {
        var self = this;

        self.instrument = ko.observable();
        self.sequenceNumber = sequenceNum;
        self.mute = ko.observable(false);
        self.solo = ko.observable(false);
        self.volume = ko.observable(.75);

        self.volume.subscribe(function (newVol) {
            MIDI.setVolume(self.top, newVol * 255);
        });

        self.soloToggle = function () {
            self.solo(!self.solo());
            if (self.solo()) {
                self.mute(false);
            }
        };

        self.muteToggle = function () {
            self.mute(!self.mute());
            if (self.mute()) {
                self.solo(false);
            }
        };
    };

    Muzart.Canvas = function (top, on, len) {
        var self = this;
	    
        self.notes = [];
        self.notesToDraw = ko.observableArray([]);
        self.on = on || 0; //starting point in base notes. 
	    self.loopAmount = 1; //1 is no loop. Loop amount is a multiplier floating point;
	    self.top = top || 0; //determines which track we are in
	    self.len = len || 4; 
        self.prevTop = null;

        self.clone = function () {
            var clone = new Muzart.Canvas(self.top, self.on, self.len);
            clone.prevTop = self.prevTop;
            clone.isSelected(self.isSelected());
            var clonedNotes = [];
            for (var note in self.notes) {
                clonedNotes.push(self.notes[note].clone());
            }
            clone.notes = clonedNotes;
            clone.notesToDraw(clone.notes);

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
		self.noteText = function (num) {
		    return MIDI.noteToKey[108 - (num || self.num)];
		};
		self.noteClass = function () {
		    //0 = C white
		    //1- B
		    //2 = A#
		    //3 = A
            var cls = ""
            if (self.noteText().length === 2) {
                cls += 'key-white ';
                if (num % 12 === 0) {
                    cls += 'key-c '
                }
                if(num ===0) {
                    cls+='key-white-tippytop';
                }
                else if (num === 87) {
                    cls+='key-white-blackontop';
                }
                else {
                    var blackonbottom = self.noteText(self.num + 1).length > 2;
                    var blackontop = self.noteText(self.num - 1).length > 2;
                    if (blackontop && blackonbottom) {
                        cls += 'key-white-sandwiched';
                    }
                    else if (blackontop) {
                        cls += 'key-white-blackontop';
                    }
                    else {
                        cls += 'key-white-blackonbottom';
                    }
                }
            }
            else {
                cls += 'key-black';
            }

            return cls;
		};
		self.play = function () {
		    try {
		        MIDI.noteOn(0, (108 - self.num), 127, 0);
		        MIDI.noteOff(0, (108 - self.num), .1);
		    }
		    catch (err) { }
		};
		self.isPlaying = false;
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
		    try
		    {
		        MIDI.noteOn(0, (108 - self.top), self.vel, 0);
		        MIDI.noteOff(0, (108 - self.top), .1);
		    }
		    catch (err) { }
		}

		var getX = function () { return self.on * viewModel.pianoRoll.gridState.gridBaseWidth(); };
		var getY = function () { return self.top * viewModel.pianoRoll.gridState.rowHeight(); };
		var getW = function () { return self.len * viewModel.pianoRoll.gridState.gridBaseWidth(); };
		var getH = function () { return viewModel.pianoRoll.gridState.rowHeight(); };

		Selectable.call(self, getX, getY, getW, getH);
	};
})(MIDI, Muzart || (Muzart = {}));