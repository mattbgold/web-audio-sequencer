(function ($) {
    'use strict';

    ko.bindingHandlers.selectGridElement = {
        init: function (element, valueAccessor, allBindings, elementModel, bindingContext) {
            var model = bindingContext.$root;

            $(element).on('mousedown', function (e) {
                model.selection.affectSelection([elementModel]);
            });

            //make the element draggable within the grid
            var topStart = 0;
            var leftStart = 0;
            var topPrev = 0;
            var leftPrev = 0;
            var wPrev = 0;
            $(element).draggable({
                grid: [ko.utils.unwrapObservable(valueAccessor()), model.gridState.rowHeight()], containment: "parent",
                start: function (event, ui) {
                    topStart = ui.position.top;
                    leftStart = ui.position.left;
                    topPrev = ui.position.top;
                    leftPrev = ui.position.left;
                },
                drag: function (event, ui) {
                    if (ui.helper.css('top') != elementModel.prevTop) {
                        var fixedTop = Math.round(ui.position.top / model.gridState.rowHeight());
                        if (elementModel.top !== fixedTop) {
                            elementModel.top = fixedTop;
                            /* trigger onDrag handler*/
                        }
                        elementModel.prevTop = ui.helper.css('top');
                    }
                    if (elementModel.isSelected()) {
                        $('.is-selected').css({
                            top: '+=' + (ui.position.top - topPrev),
                            left: '+=' + (ui.position.left - leftPrev)
                        });
                    }
                    topPrev = ui.position.top;
                    leftPrev = ui.position.left;
                },
                //reset element position and delete underlying elements when we stop dragging
                stop: function (e, ui) {
                    // this math rounding is a hack to fix jquery ui bugs
                    var fixedLeft = Math.round(ui.position.left / model.gridState.gridBaseWidth());
                    var fixedTop = Math.round(ui.position.top / model.gridState.rowHeight());
                    $(ui.helper).css('left', fixedLeft * model.gridState.gridBaseWidth() + 'px');
                    $(ui.helper).css('top', fixedTop * model.gridState.rowHeight() + 'px');

                    elementModel.on = fixedLeft;
                    elementModel.top = fixedTop;

                    if (elementModel.isSelected()) {
                        $.each(model.selection.selectedElements(), function (i, element) {
                            if (element != elementModel) {
                                element.on += fixedLeft - Math.round(leftStart / model.gridState.gridBaseWidth())
                                element.top += fixedTop - Math.round(topStart / model.gridState.rowHeight())
                            }
                        });
                    }
                }
            });

            //make the element resizable
            $(element).resizable({
                grid: ko.utils.unwrapObservable(valueAccessor()), handles: 'e', containment: "parent",
                start: function (e, ui) {
                    wPrev = $(ui.helper).width();
                },
                resize: function (e, ui) {
                    if (elementModel.isSelected()) {
                        var deltaW = (ui.size.width - wPrev);

                        var elementsToResize = $('.is-selected').filter(function (i, element) {
                            return deltaW > 0 || $(element).width() > model.gridState.gridSnapWidth();
                        });

                        $(elementsToResize).css({
                            width: '+=' + deltaW
                        });
                        $(ui.helper).width(ui.size.width);
                        wPrev = ui.size.width;
                    }
                },
                stop: function (e, ui) {
                    var deltaW = (ui.size.width - elementModel.len * model.gridState.gridBaseWidth());
                    var fixedLength = Math.round(ui.size.width / model.gridState.gridBaseWidth());
                    elementModel.len = fixedLength;
                    $(ui.helper).css('width', fixedLength * model.gridState.gridBaseWidth() + 'px'); //hack to fix bug in jqueryUI resizable
                    if (elementModel.isSelected()) {
                        $.each(model.selection.selectedElements(), function (i, element) {
                            if (element != elementModel) {
                                element.len += Math.round(deltaW / model.gridState.gridBaseWidth());
                            }
                        });
                    }
                }
            });

        },
        //adapt to zoom
        update: function (element, valueAccessor, allBindings, elementModel, bindingContext) {
            var model = bindingContext.$root;
            $(element).draggable("option", "grid", [ko.utils.unwrapObservable(valueAccessor()), model.gridState.rowHeight()]);
            $(element).resizable("option", "grid", ko.utils.unwrapObservable(valueAccessor()));

            $(element).css('width', elementModel.len * model.gridState.gridBaseWidth() + 'px').css('left', elementModel.on * model.gridState.gridBaseWidth() + 'px').css('top', elementModel.top * model.gridState.rowHeight() + 'px');
        }
    }

    ko.bindingHandlers.gridNote = {
		init: function(element, valueAccessor, allBindings, noteModel, bindingContext) {
			var model = bindingContext.$component.model;
			
			//play note on mousedown, but not on the draggable trigger
			$(element).on('mousedown', function(e) { 
				model.removeNote(noteModel, e); 
				if(e.which===1 && dp===false){
					noteModel.play(); 
				}
				dp=false;
				model.selection.affectSelection([noteModel]);
			}).on('mousemove', function(e) {model.removeNote(noteModel, e);});
			
			//make the note draggable within the piano roll
			var topStart=0;
			var leftStart=0;
			var topPrev=0;
			var leftPrev = 0;
			var wPrev = 0; 
			$(element).draggable({
			    grid: [ko.utils.unwrapObservable(valueAccessor()), model.gridState.rowHeight()], containment: "parent",
				start: function(event, ui) {
					topStart = ui.position.top;
					leftStart = ui.position.left;
					topPrev = ui.position.top;
					leftPrev = ui.position.left;
				},
				//detect when the note changes key when dragging and play note
				drag: function(event, ui) {
					if(ui.helper.css('top') != noteModel.prevTop) {
					    var fixedTop = Math.round(ui.position.top / model.gridState.rowHeight());
						if(noteModel.top !== fixedTop) {
							noteModel.top = fixedTop;
							noteModel.play();
						}
						noteModel.prevTop = ui.helper.css('top');
					}
					if(noteModel.isSelected()) {
						$('.note.is-selected').css({
							top: '+=' + (ui.position.top-topPrev),
							left: '+=' + (ui.position.left-leftPrev)
						});
					}
					topPrev = ui.position.top;
					leftPrev = ui.position.left;
				},
				//reset note position and delete underlying notes when we stop dragging
				stop: function(e, ui) {
					// this math rounding is a hack to fix jquery ui bugs
				    var fixedLeft = Math.round(ui.position.left / model.gridState.gridBaseWidth());
				    var fixedTop = Math.round(ui.position.top / model.gridState.rowHeight());
					$(ui.helper).css('left', fixedLeft * model.gridState.gridBaseWidth() + 'px');
					$(ui.helper).css('top', fixedTop * model.gridState.rowHeight() + 'px');
					
					noteModel.on = fixedLeft;
					noteModel.top = fixedTop;
					
					if(noteModel.isSelected()) {
						$.each(model.selection.selectedElements(), function(i, note) {
							if(note!=noteModel) {
							    note.on += fixedLeft - Math.round(leftStart / model.gridState.gridBaseWidth())
							    note.top += fixedTop - Math.round(topStart / model.gridState.rowHeight())
							}
						});
					}
				}
			});

			//make the note resizable
			$(element).resizable({
			    grid: ko.utils.unwrapObservable(valueAccessor()), handles: 'e', containment: "parent",
			    start: function(e, ui) {
			        wPrev = $(ui.helper).width();
			    },
			    resize: function (e, ui) {
			        if (noteModel.isSelected()) {
			            var deltaW = (ui.size.width - wPrev);

			            var notesToResize = $('.note.is-selected').filter(function (i, note) {
			                return deltaW > 0 || $(note).width() > model.gridState.gridSnapWidth();
			            });

			            $(notesToResize).css({
			                width: '+=' + deltaW
			            });
			            $(ui.helper).width(ui.size.width);
			            wPrev = ui.size.width;
			        }
			    },
			    stop: function (e, ui) {
			        var deltaW = (ui.size.width - noteModel.len * model.gridState.gridBaseWidth());
			        var fixedLength = Math.round(ui.size.width / model.gridState.gridBaseWidth());
			        noteModel.len = fixedLength;
			        $(ui.helper).css('width', fixedLength * model.gridState.gridBaseWidth() + 'px'); //hack to fix bug in jqueryUI resizable
					if(noteModel.isSelected()) {
						$.each(model.selection.selectedElements(), function(i, note) {
							if(note!=noteModel) {
							    note.len += Math.round(deltaW / model.gridState.gridBaseWidth());
							}
						});
					}
			    }
			});
			
		},

		//adapt to zoom
		update: function(element, valueAccessor, allBindings, noteModel, bindingContext) {
			var model = bindingContext.$component.model;
			$(element).draggable("option", "grid", [ko.utils.unwrapObservable(valueAccessor()), model.gridState.rowHeight()]);
			$(element).resizable("option", "grid", ko.utils.unwrapObservable(valueAccessor()));
			
			$(element).css('width', noteModel.len * model.gridState.gridBaseWidth() + 'px').css('left', noteModel.on * model.gridState.gridBaseWidth() + 'px').css('top', noteModel.top * model.gridState.rowHeight() + 'px');
		}
	};
	
	ko.bindingHandlers.boxSelect = {
		init: function(element, valueAccessor, allBindings) {
			var onSelect = valueAccessor();
			var $container = $(element).parent();
			var hidden = true;
			var x1=0, x2=0, y1=0, y2=0;
			var reCalc = function () {
				var x3 = Math.min(x1,x2);
				var x4 = Math.max(x1,x2);
				var y3 = Math.min(y1,y2);
				var y4 = Math.max(y1,y2);
				element.style.left = x3 + 'px';
				element.style.top = y3 + 'px';
				element.style.width = x4 - x3 + 'px';
				element.style.height = y4 - y3 + 'px';
			};
			
			var offset = $container.offset();
			
			$container.mousedown(function(e) {
				if(e.ctrlKey) {
					$(element).show();
					hidden=false;
					x1 = e.pageX - offset.left;
					y1 = e.pageY - offset.top;
					reCalc();
				}
			}).mousemove(function(e) {
				if(!hidden) {
					x2 = e.pageX - offset.left;
					y2 = e.pageY - offset.top;
					reCalc();
				}
			}).mouseup(function(e) {
				if(!hidden) {
					var x3 = Math.min(x1,x2);
					var x4 = Math.max(x1,x2);
					var y3 = Math.min(y1,y2);
					var y4 = Math.max(y1,y2);
					
					onSelect(x3, x4, y3, y4);
					$(element).hide();
				}
			});
		}
	}
		
})(jQuery);