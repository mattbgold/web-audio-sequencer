(function ($) {
    'use strict';

    ko.bindingHandlers.gridNote= {
		init: function(element, valueAccessor, allBindings, noteModel, bindingContext) {
			var model = bindingContext.$root;
			
			//play note on mousedown, but not on the draggable trigger
			$(element).on('mousedown', function(e) { 
				model.removeNote(noteModel, e); 
				if(e.which===1 && dp===false){
					noteModel.play(true); 
				}
				dp=false;
				model.affectSelection([noteModel]);
			}).on('mousemove', function(e) {model.removeNote(noteModel, e);});
			
			//make the note draggable within the piano roll
			$(element).draggable({grid: [ ko.utils.unwrapObservable(valueAccessor()), trackHeight ], containment: "parent", 
				//detect when the note changes key when dragging and play note
				drag: function(event, ui) {
					if(ui.helper.css('top') != noteModel.prevTop) {
						var fixedTop = Math.round(ui.position.top/trackHeight);
						if(noteModel.top !== fixedTop) {
							noteModel.top = fixedTop;
							noteModel.play(true);
						}
						noteModel.prevTop = ui.helper.css('top');
					}
				},
				//reset note position and delete underlying notes when we stop dragging
				stop: function(e, ui) {
					// this math rounding is a hack to fix jquery ui bugs
					var fixedLeft = Math.round(ui.position.left/model.gridBaseWidth());
					var fixedTop = Math.round(ui.position.top/trackHeight);
					$(ui.helper).css('left', fixedLeft*model.gridBaseWidth() + 'px');
					$(ui.helper).css('top', fixedTop*trackHeight + 'px');
					
					var overlappedNote = $.grep(model.notes(), function(n,i) {
						return (n!=noteModel && n.on == fixedLeft && n.top == fixedTop);
					});
					if(overlappedNote.length > 0) {
						model.notes.remove(overlappedNote[0]);
					}
					noteModel.on = fixedLeft;
					noteModel.top = fixedTop;
				}
			});

			//make the note resizable
			$(element).resizable({grid: ko.utils.unwrapObservable(valueAccessor()), handles: 'e', containment: "parent", 
				stop: function(e, ui) {
					var fixedLength = Math.round(ui.size.width/model.gridBaseWidth());
					noteModel.len = fixedLength;
					$(ui.helper).css('width', fixedLength * model.gridBaseWidth() + 'px'); //hack to fix bug in jqueryUI resizable
				}
			});
			
		},

		//adapt to zoom
		update: function(element, valueAccessor, allBindings, noteModel, bindingContext) {
			var model = bindingContext.$root;
			$(element).draggable("option", "grid", [ ko.utils.unwrapObservable(valueAccessor()), trackHeight ]);
			$(element).resizable("option", "grid", ko.utils.unwrapObservable(valueAccessor()));
			
			$(element).css('width', noteModel.len*model.gridBaseWidth() + 'px').css('left', noteModel.on*model.gridBaseWidth()+'px').css('top', noteModel.top*trackHeight +'px');
		}
	};
})(jQuery);