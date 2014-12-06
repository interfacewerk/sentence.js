'use strict';

var conditions = function(when, names, callback) {
    if(names.length === 1) {
        var name = names[0];
        return {
            verifies: function(f) {
                callback(function(newValues,oldValues){
                    return f(newValues[name],oldValues[name]);
                });
                return actions(when);
            },
            is: function(v) {
                callback(function(newValues,oldValues){
                    return newValues[name] === v;
                });
                return actions(when);
            },
            isNot: function(v) {
                callback(function(newValues,oldValues){
                    return newValues[name] !== v;
                });
                return actions(when);
            },
            isDefined: function() {
                callback(function(newValues,oldValues){
                    return newValues[name] !== undefined;
                });
                return actions(when);
            },
            isUndefined: function() {
                callback(function(newValues,oldValues){
                    return newValues[name] === undefined;
                });
                return actions(when);
            },
            becomes: function(v) {
                callback(function(newValues,oldValues){
                    return newValues[name] === v && newValues[name] !== oldValues[name];
                });
                return actions(when);
            }
        };
    } else {
        return {
            verify: function(fct) {
                callback(fct);
                return actions(when);
            }
        }
    }

};