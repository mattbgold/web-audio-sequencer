var Muzart;

(function ($, Muzart) {
    'use strict';

    Muzart.PlayerModel = function (tracks) {
        var self = this;

        var _tracks = tracks;
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

        self.bpm = ko.observable(140);

        self.bpmScale = ko.pureComputed(function () {
            var bps = (self.bpm() / 60); //quarter notes per second
            return bps * 8; // base notes per second
        });

        var startTime = new Date();
        self.playTime = ko.observable(0.0);
        var updateInterval;
        var updatePlayTime = function () {
            self.playTime((new Date() - self.startTime) / 1000);

        };
        self.noteQueue = [];

        self.isPlaying = ko.observable(false);
        self.doLoop = ko.observable(false);

        self.playNote = function (note) {
            MIDI.noteOn(0, (108 - note.top), note.vel, 0);
            MIDI.noteOff(0, (108 - note.top), note.len / self.bpmScale());
        }

        self.play = function (canvasesToPlay, playImmediately) {
            //21 = A0, 108 = Gb7
            //self.stop(); TODO: Just commented this out!!! we dont want to restart the playhead!
            self.startTime = new Date();
            updateInterval = setInterval(updatePlayTime, 20);
            MIDI.setVolume(0, 127);

            ko.utils.arrayForEach(ko.utils.unwrapObservable(canvasesToPlay), function (canvas) {
                var track = getTrack(canvas);
                ko.utils.arrayForEach(canvas.notes, function (note) {
                    self.noteQueue.push(setTimeout(function () {
                        //TODO: offset note.on start time by the current self.playTime!
                        //test this, might be too slow.
                        if (!track.mute() && (track.solo() || !anySoloTracks())) {
                            self.playNote(note);
                        }
                    }, ((note.on + (playImmediately ? 0 : canvas.on)) / self.bpmScale()) * 1000));
                });
            });
            self.isPlaying(true);
        };

        self.stop = function (doPause) {
            clearInterval(updateInterval);
            MIDI.stopAllNotes();
            $.each(self.noteQueue, function (i, val) {
                clearTimeout(val);
            });
            self.noteQueue = [];
            self.isPlaying(false);
            if (doPause !== true) {
                self.playTime(0.0);
            }
        };

        self.pause = function () {
            self.stop(true);
        };

        self.loopToggle = function () {
            self.doLoop(!self.doLoop());
        }
    };
})(jQuery, Muzart || (Muzart = {}));