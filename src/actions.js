'use strict';

var actions = function(when) {
    var that = {
        do: function(f) {
            that.and = undefined;
            that.for = undefined;
            when.do = f;
            return that;
        },
        anyway: function(f) {
            that.and = undefined;
            that.for = undefined;
            when.anyway = f;
            return that;
        },
        otherwise: function(f) {
            that.and = undefined;
            that.for = undefined;
            when.otherwise = f;
            return that;
        },
        and: function() {
            return when.onAnd(
                Array.prototype.slice.call(arguments)
            );
        },
        // the 'do' will be executed
        // if conditions are met for 'duration' milliseconds 
        // NB: a timeout is set the first time conditions are met
        // and cleared when the are not anymore
        for: function(duration) { // in milliseconds
            that.and = undefined;
            when.for = duration;
            return that;
        }
    };
    return that;
};