var Muzart;

(function ($, Muzart) {
    'use strict';

    Muzart.SelectionModel = function (selectables) {
        var self = this;

        self.copyBuffer = [];

        self.selectedElements = ko.pureComputed(function () {
            return ko.utils.arrayFilter(selectables(), function (obj) {
                return obj.isSelected();
            });
        });

        self.deselectAll = function (element) {
            if (element && !element.type) {
                element.isSelected(false);
            }
            else {
                $.each(selectables(), function (i, obj) {
                    obj.isSelected(false);
                });
                return false;
            }
        };
        self.selectAll = function (element) {
            if (element && !element.type) {
                element.isSelected(true);
            }
            else {
                $.each(selectables(), function (i, obj) {
                    obj.isSelected(true);
                });
            }
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
            if (objs.length === 1 && !Muzart.inputs.ctrl()) {
                //deselect all when we click something that is not selected, i.e. "click out"
                if (!objs[0].isSelected()) {
                    self.deselectAll();
                    objs[0].isSelected(true);
                }

                return;
            }

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

        //if element is passed in, just perform the action on that. Otherwise, perform the action on the selection

        self.deleteSelection = function (element) {
            if (element && !element.type) {
                selectables.remove(element);
            }
            else {
                $.each(self.selectedElements(), function (i, obj) {
                    selectables.remove(obj);
                });
            }
            return false;
        };

        self.copySelection = function (element) {
            self.copyBuffer = [];
            if (element && !element.type) {
                self.copyBuffer.push(element.clone());
            }
            else {
                $.each(self.selectedElements(), function (i, obj) {
                    self.copyBuffer.push(obj.clone());
                });
            }
            return false;
        };

        self.cutSelection = function (element) {

            self.copyBuffer = [];
            if (element && !element.type) {
                self.copyBuffer.push(element.clone());
            }
            else {
                $.each(self.selectedElements(), function (i, obj) {
                    self.copyBuffer.push(obj.clone());
                });
            }
            self.deleteSelection(element);

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

        self.selectionExists = function () {
            return self.selectedElements().length > 0;
        };
        self.canPaste = function () {
            return self.copyBuffer.length > 0;
        };
    };
})(jQuery, Muzart || (Muzart = {}));