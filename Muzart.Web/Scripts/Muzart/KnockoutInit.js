(function ($) {
    'use strict';

    //component loader that can load from a partial view. adding to beginning of array gives it priority over the default component loader. 
    ko.components.loaders.unshift({
        loadTemplate: function (name, url, callback) {
            if (url) {
                $.get(url, function (markupString) {
                    // We need an array of DOM nodes, not a string.
                    // We can use the default loader to convert to the
                    // required format.
                    ko.components.defaultLoader.loadTemplate(name, markupString, callback);
                });
            } else {
                // Unrecognized config format. Let another loader try to handle it.
                callback(null);
            }
        }
    });
})(jQuery);