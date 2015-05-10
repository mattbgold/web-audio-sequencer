var Muzart;

(function ($, Muzart) {
    'use strict';

    Muzart.PlayerModel = function () {
        var self = this;

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

        self.play = function (notesToPlay) {
            //21 = A0, 108 = Gb7
            self.stop();
            self.startTime = new Date();
            updateInterval = setInterval(updatePlayTime, 20);
            MIDI.setVolume(0, 127);
            ko.utils.arrayForEach(notesToPlay, function (note) {
                self.noteQueue.push(setTimeout(function () { self.playNote(note) }, (note.on / self.bpmScale()) * 1000));
            });
            self.isPlaying(true);
        };

        self.isPlaying = ko.observable(false);
        self.doLoop = ko.observable(false);

        self.playNote = function (note) {
            MIDI.noteOn(0, (108 - note.top), note.vel, 0);
            MIDI.noteOff(0, (108 - note.top), note.len / self.bpmScale());
        }

        self.stop = function () {
            clearInterval(updateInterval);
            MIDI.stopAllNotes();
            $.each(self.noteQueue, function (i, val) {
                clearTimeout(val);
            });
            self.noteQueue = [];
            self.isPlaying(false);
        };

        self.loopToggle = function () {
            self.doLoop(!self.doLoop());
        }
    };
})(jQuery, Muzart || (Muzart = {}));