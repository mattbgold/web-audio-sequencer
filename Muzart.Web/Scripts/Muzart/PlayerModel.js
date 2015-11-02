var Muzart;

(function ($, Muzart) {
    'use strict';

    Muzart.PlayerModel = function (tracks, pianoRoll) {
        var self = this;

        var _tracks = tracks;
        var _pianoRoll = pianoRoll;

        var getTrack = function (canvas) {
            return _tracks()[canvas.top];
        };

        var anySoloTracks = function () {
            var tr = _tracks();
            for (var i in tr) {
                if (tr[i].solo()) {
                    return true;
                }
            }
            return false;
        };

        self.bpm = ko.observable(120);

        self.bpmScale = ko.pureComputed(function () {
            var bps = (self.bpm() / 60); //quarter notes per second
            return bps * 8; // base notes per second
        });

        self.t = ko.observable(0); //the location of the playhead

        var _timers = {
            nextEvent: null
        };

        self.isPlaying = ko.observable(false);
        self.doLoop = ko.observable(false);

        var _notesPlaying = {};
        self.playNote = function (note, track) {
            //var channel = track ? track.sequenceNumber : 0;
            //lets stick to channel 0. Midi.js sets each channel instrument to a different number by default, and we only loaded instrument 0
            var channel = 0;
            MIDI.noteOn(channel, (108 - note.top), note.vel, 0);
            MIDI.noteOff(channel, (108 - note.top), note.len / self.bpmScale());

            _pianoRoll.tracks[note.top].isPlaying(true);

            clearTimeout(_notesPlaying[note.top]);
            _notesPlaying[note.top] = setTimeout(function () {
                _pianoRoll.tracks[note.top].isPlaying(false);
            }, note.len / self.bpmScale() * 1000);
        }

        self.play = function (canvasesToPlay, inPianoRoll) {
            self.isPlaying(true);

            advanceSong(ko.utils.unwrapObservable(canvasesToPlay), inPianoRoll);
        };

        self.stop = function (doPause) {
            clearInterval(_timers.nextEvent);
            MIDI.stopAllNotes();

            self.isPlaying(false);
            if (doPause !== true) {
                self.t(0);
            }
        };

        self.pause = function () {
            self.stop(true);
        };

        self.loopToggle = function () {
            self.doLoop(!self.doLoop());
        }

        var advanceSong = function (canvases, inPianoRoll) {
            var tEnd = 0;
            ko.utils.arrayForEach(canvases, function (canvas) {
                if ((inPianoRoll ? 0 : canvas.on) + canvas.len > tEnd)
                    tEnd = (inPianoRoll ? 0 : canvas.on) + canvas.len;
                //dont process notes in canvases that are out-of-range
                if (inPianoRoll || (canvas.on + canvas.len > self.t() && canvas.on <= self.t())) {
                    ko.utils.arrayForEach(canvas.notes, function (note) {
                        var noteT = note.on + (inPianoRoll ? 0 : canvas.on);
                        if (noteT === self.t()) {
                            if (!getTrack(canvas).mute() && (getTrack(canvas).solo() || !anySoloTracks())) {
                                self.playNote(note, getTrack(canvas));
                            }
                        }
                        else if (noteT > self.t() && noteT < self.t() + 1) {
                            if (!getTrack(canvas).mute() && (getTrack(canvas).solo() || !anySoloTracks())) {
                                setTimeout(function () {
                                    self.playNote(note, getTrack(canvas));
                                }, (((note.on + (inPianoRoll ? 0 : canvas.on)) - self.t()) / self.bpmScale()) * 1000);
                            }
                        }
                    });
                }
            });

            //determine if we are at the end of the song and loop if necessary
            if (self.t() >= tEnd) {
                if (self.doLoop()) {
                    self.t(0);
                    advanceSong(canvases, inPianoRoll);
                }
                else {
                    self.stop();
                    return;
                }
            }
            else {
                //call this function   again on the next beat
                _timers.nextEvent = setTimeout(function () {
                    self.t(self.t() + 1);
                    advanceSong(canvases, inPianoRoll);
                }, 1 / self.bpmScale() * 1000);
            }
        };
    };
})(jQuery, Muzart || (Muzart = {}));