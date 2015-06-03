(function ($) {
    'use strict';

    ko.bindingHandlers.selectGridElement = {
        init: function (element, valueAccessor, allBindings, elementModel, bindingContext) {
            var model = bindingContext.$parent; //$root

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
                            var onDrag = allBindings.get('onDrag');
                            if (onDrag) {
                                onDrag(event, ui);
                            }
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
            var model = bindingContext.$parent;
            $(element).draggable("option", "grid", [ko.utils.unwrapObservable(valueAccessor()), model.gridState.rowHeight()]);
            $(element).resizable("option", "grid", ko.utils.unwrapObservable(valueAccessor()));

            $(element).css('width', elementModel.len * model.gridState.gridBaseWidth() + 'px').css('left', elementModel.on * model.gridState.gridBaseWidth() + 'px').css('top', elementModel.top * model.gridState.rowHeight() + 'px');
        }
    };

    ko.bindingHandlers.boxSelect = {
        init: function (element, valueAccessor, allBindings) {
            var onSelect = valueAccessor();
            var $container = $(element).parent();
            var hidden = true;
            var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
            var reCalc = function () {
                var x3 = Math.min(x1, x2);
                var x4 = Math.max(x1, x2);
                var y3 = Math.min(y1, y2);
                var y4 = Math.max(y1, y2);
                element.style.left = x3 + 'px';
                element.style.top = y3 + 'px';
                element.style.width = x4 - x3 + 'px';
                element.style.height = y4 - y3 + 'px';
            };

            

            $container.mousedown(function (e) {
                var offset = $container.offset();
                if (e.ctrlKey) {
                    $(element).show();
                    hidden = false;
                    x1 = e.pageX - offset.left;
                    y1 = e.pageY - offset.top;
                    reCalc();
                }
            }).mousemove(function (e) {
                var offset = $container.offset();
                if (!hidden) {
                    x2 = e.pageX - offset.left;
                    y2 = e.pageY - offset.top;
                    reCalc();
                }
            }).mouseup(function (e) {
                if (!hidden) {
                    var x3 = Math.min(x1, x2);
                    var x4 = Math.max(x1, x2);
                    var y3 = Math.min(y1, y2);
                    var y4 = Math.max(y1, y2);

                    onSelect(x3, x4, y3, y4);
                    $(element).hide();
                }
            });
        }
    };

    ko.bindingHandlers.perfectScrollbar = {
        init: function (element, valueAccessor) {
            $(element).css('position', 'relative');
            $(element).perfectScrollbar();
        },
        update: function (element, valueAccessor) {
            if (ko.unwrap(valueAccessor())) {
                element.scrollTop = 0;
                element.scrollLeft = 0;
                $(element).perfectScrollbar('update');
            }
        }
    };

    ko.bindingHandlers.dialog = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var options = ko.utils.unwrapObservable(valueAccessor()) || {};
            var isOpen = allBindingsAccessor().dialogVisible;
            var dialog;

            $(element).hide();

            isOpen.subscribe(function (newValue) {
                if (newValue) {
                    dialog = bootbox.dialog($.extend(options, {
                        message: $(element).html()
                    }));
                }
                else {
                    dialog.modal('hide');
                }
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            /*var options = ko.utils.unwrapObservable(valueAccessor()) || {};
            if ($(element).hasClass('ui-dialog-content')) {
                if (options.title) {
                    $(element).dialog('option', 'title', options.title);
                }
                if (options.buttons) {
                    $(element).dialog('option', 'buttons', options.buttons);
                }
                if (options.width) {
                    $(element).dialog('option', 'width', options.width);
                }
            }*/
        }
    };
		
    ko.bindingHandlers.dblClick = {
        init: function (element, valueAccessor, allBindings, bindingContext) {
            $(element).on('dblclick', function () { valueAccessor()(bindingContext) });
        }
    }

    ko.bindingHandlers.contextMenu = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var menuActions = ko.utils.unwrapObservable(valueAccessor());
            var menuId = 'menu-' + Math.random().toString(36);
            $(element).on('contextmenu', function (e) {
                //ctrl-context-menu designated for different function
                $('.dropdown-menu').remove();
                if (e.ctrlKey) return;

                //open menu
                var $menu = $('<ul class="dropdown-menu" role="menu"></ul>').attr('id', menuId).data("invokedOn", $(e.target))
                    .insertAfter('body').show()
                    .css({
                        position: "absolute",
                        left: getMenuPosition(e.clientX, 'width', 'scrollLeft'),
                        top: getMenuPosition(e.clientY, 'height', 'scrollTop')
                    })
                    .off('click')
                    .on('click', function (e) {
                        $(this).remove();
                    });

                for (var i in menuActions) {
                    var action = menuActions[i];
                    $menu.append($('<li></li>').append($('<a tabindex="-1" href="#"><i class="fa fa-fw ' + action.icon + '"></i> ' + action.text + '</a>').on('click', action.handler)));
                }

                return false;

            });

            //make sure menu closes on any click
            $(document).click(function () {
                $('.dropdown-menu').remove();
            });

            function getMenuPosition(mouse, direction, scrollDir) {
                var win = $(window)[direction](),
                    scroll = $(window)[scrollDir](),
                    menu = $('.dropdown-menu')[direction](),
                    position = mouse + scroll;

                // opening menu would pass the side of the page
                if (mouse + menu > win && menu < mouse)
                    position -= menu;

                return position;
            }
        }
    }
})(jQuery);