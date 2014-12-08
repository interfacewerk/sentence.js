'use strict';

var Sentence = function() {
    var that = this;

    var privateVariables = {};

    var whens = [];

    that.get = function(/*name,name,name,...*/) {
        if(arguments.length === 0) {
            return privateVariables;
        }
        if(arguments.length === 1) {
            return privateVariables[arguments[0]];    
        }
        var result = {};
        for(var i=0;i<arguments.length;i++) {
            result[arguments[i]] = privateVariables[arguments[i]];
        }
        return result;
    };

    that.set = function(/*name,value,name,value ... OR {name:value,name:value,...}*/) {
        var oldValues = JSON.parse(JSON.stringify(privateVariables));
        var names = [];
        if(arguments.length === 1) {
            var arg1 = arguments[0];
            for(var name in arg1) {
                privateVariables[name] = arg1[name];
                names.push(name);
            }
        } else {
            for(var i=0;i<arguments.length/2;i++) {
                privateVariables[arguments[2*i]] = arguments[2*i + 1];
                names.push(arguments[2*i]);
            }
        }
        setTimeout(function() {
            var newValues = privateVariables;
            whens.forEach(function(w) {
                try {
                    w.process(names, newValues, oldValues);
                } catch(e) {
                    console.error("sentence.js: an error occured when processing a when");
                }
            });
        }, 0);
        return that;
    };

    that.remove = function(w) {
        whens.some(function(_w,idx) {
            if(_w.interface === w) {
                whens.splice(idx,1);
                return true;
            }
            return false;
        });
        return that;
    };

    that.when = function(/*name1,name2,name3,...*/) {
        var names = Array.prototype.slice.call(arguments);
        var w = new When(that, names);
        whens.push(w);
        return w.interface;
    };

    that.says = function() {
        return {
            that : function(name) {
                var aThat = new That(that, name);
                return aThat;
            }
        };
    };
    
};
