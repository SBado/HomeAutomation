(function () {
    "use strict";

    angular.module("climateControl")
        .factory("ClipboardService", [ClipboardService]);

    function ClipboardService() {

        console.log('ClipboardService instantiated');

        var clipboardHandler = {};
        var clipboard = {};
        clipboard.type = '';
        clipboard.values = [];

        var ClipboardTypeValue = function (arg) {
            arg = arg || '';
            return arg.toLowerCase();
        }

        var clipboardType = {
            HOUR: ClipboardTypeValue('HOUR'),
            DAY: ClipboardTypeValue('DAY'),
            WEEK: ClipboardTypeValue('WEEK'),
            MONTH: ClipboardTypeValue('MONTH')
        };

        clipboardHandler.set = function (type, value) {

            if (!type instanceof ClipboardTypeValue)
                return false;

            clipboard.type = type;
            clipboard.values.length = 0;
            if (value instanceof Array)
                clipboard.values = value;
            else
                clipboard.values.push(value)

        };

        clipboardHandler.get = function () {
            return clipboard;
        };

        return {
            type: clipboardType,
            clipboard: clipboardHandler
        }
    }

})();