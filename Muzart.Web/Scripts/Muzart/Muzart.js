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
	    self.clone = function () {
	        alert('Clone not implemented!');
	    }
	};

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

        //TODO: get rid of all references to viewModel and trackHeight
		self.play = function (preview) {
		    MIDI.noteOn(0, (108 - self.top), self.vel, 0);
		    MIDI.noteOff(0, (108 - self.top), preview ? .1 : (self.len) / viewModel.bpmScale());
		}

		var getX = function () { return self.on * viewModel.gridBaseWidth(); };
		var getY = function () { return self.top * trackHeight; };
		var getW = function () { return self.len * viewModel.gridBaseWidth(); };
		var getH = function () { return trackHeight; };

		Selectable.call(self, getX, getY, getW, getH);
	};

    
	Muzart.SelectionManager = function (selectables) {
	    var self = this;

	    self.copyBuffer = [];

	    self.selectedElements = ko.pureComputed(function () {
	        return ko.utils.arrayFilter(selectables(), function (obj) {
	            return obj.isSelected();
	        });
	    });

	    self.deselectAll = function () {
	        $.each(selectables(), function (i, obj) {
	            obj.isSelected(false);
	        });
	        return false;
	    };
	    self.selectAll = function () {
	        $.each(selectables(), function (i, obj) {
	            obj.isSelected(true);
	        });
	        return false;
	    };

	    self.onBoxSelect = function (x1, x2, y1, y2) {
	        var boxedObjs = [];
	        $.each(selectables(), function (i, obj) {

	            //with each object
	            if (obj.getX() < x2 && obj.getX() + obj.getW() > x1 && obj.getY() < y2 && obj.getY() + obj.getH() > y1) {
	                boxedObjs.push(obj);
	                //select the object
	            }
	        });

	        self.affectSelection(boxedObjs);
	    };

	    self.affectSelection = function (objs) {
	        //add, remove, objects from selection using inputs to determine
	        if (Muzart.inputs.ctrl() && !Muzart.inputs.shift() && !Muzart.inputs.alt()) {
	            self.deselectAll();
	        }
	        $.each(objs, function (i, obj) {
	            if (Muzart.inputs.ctrl() && Muzart.inputs.alt()) {
	                obj.isSelected(false);
	            }
	            else if (Muzart.inputs.ctrl()) {
	                obj.isSelected(true);
	            }
	        });
	    };

	    self.deleteSelection = function () {
	        $.each(self.selectedElements(), function (i, obj) {
	            selectables.remove(obj);
	        });
	        return false;
	    };

	    self.copySelection = function () {
	        self.copyBuffer = [];
	        $.each(self.selectedElements(), function (i, obj) {
	            self.copyBuffer.push(obj.clone());
	        });
	        return false;
	    };

	    self.cutSelection = function () {
	        self.copyBuffer = [];
	        $.each(self.selectedElements(), function (i, obj) {
	            self.copyBuffer.push(obj.clone());
	        });
	        self.deleteSelection();
	        return false;
	    };

	    self.pasteSelection = function () {
	        self.deselectAll();
	        $.each(self.copyBuffer, function (i, obj) {
	            selectables.push(obj);
	            obj.isSelected(true);
	        });
	        self.copySelection(); //refresh the copy buffer with newly cloned instances
	        return false;
	    };
	};


})(MIDI, Muzart || (Muzart = {}));