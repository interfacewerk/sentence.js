var Sentence = function() {
    'use strict';
    var that = this;

    var privateVariables = {};

    var whens = [];

    this.getVariable = function(name) {
        return privateVariables[name];    
    };

    var verifyWhen = function(w,newValue,oldValue) {
        return typeof(w.fctToVerify) === "function" && w.fctToVerify(newValue, oldValue)
    };

    var doWhen = function(w,newValue,oldValue) {
        w.do && w.do.call(null,newValue,oldValue);
    };

    var otherWiseWhen = function(w,newValue,oldValue) {
        w.otherwise && w.otherwise.call(null,newValue,oldValue);
    };

    var anywayWhen = function(w,newValue,oldValue) {
        w.anyway && w.anyway.call(null,newValue,oldValue);
    };

    this.setVariable = function(name/*string*/, value/*Object*/) {
        var oldValue = privateVariables[name];
        privateVariables[name] = value;
        setTimeout(function() {
            whens
            .filter(function(w) {
                return w.propertyName === name;
            })
            .forEach(function(w) {
                w.process(value,oldValue);
            })
        },0);
        return this;
    };

    var when = function(name) {
        return {
            propertyName: name,
            fctToVerify: undefined,
            do: undefined,
            otherwise: undefined,
            anyway: undefined,
            process: function(newValue,oldValue) {
                if(verifyWhen(this,newValue,oldValue)) {
                    doWhen(this,newValue,oldValue);
                } else {
                    otherWiseWhen(this,newValue,oldValue);
                }
                anywayWhen(this,newValue,oldValue);
            }
        };
    };

    var conditions = function(w, actions) {
        return {
            verifies: function(fct2) {
                w.fctToVerify = fct2;
                return actions;
            },
            is: function(v) {
                w.fctToVerify = function(value) {
                    return value === v;
                };
                return actions;
            },
            isNot: function(v) {
                w.fctToVerify = function(value) {
                    return value !== v;
                };
                return actions;
            },
            isDefined: function() {
                w.fctToVerify = function(value) {
                    return value !== undefined;
                };
                return actions;
            },
            isUndefined: function() {
                w.fctToVerify = function(value) {
                    return value === undefined;
                };
                return actions;
            },
            becomes: function(v) {
                w.fctToVerify = function(newValue,oldValue) {
                    return v === newValue && newValue !== oldValue;
                };
                return actions;
            },
            remove: function() {
                var idx = whens.indexOf(w);
                if(idx >= 0) {
                    whens.splice(idx,1);
                }
                return; // undefined because from now, this When is useless
            }
        };
    };

    var actions = function(name, w) {
        var result = {
            do: function(fct) {
                w.do = fct;
                return this;
            },
            otherwise: function(fct) {
                w.otherwise = fct;
                return this;
            },
            anyway: function(fct) {
                w.anyway = fct;
                return this;
            },
            and: function(name2) {
                name2 = name2 || name;
                var fctToVerify2;

                var w2 = when(name2);
                whens.push(w2);

                var actions2 = actions(name2,w2);
                actions2.do = function(fct) {
                    w2.do = function(newValue,oldValue) {
                        var value = that.getVariable(name);
                        if(w.fctToVerify.call(null,value,value)) {
                            fct.call(null,newValue,oldValue);
                        }
                    };
                    return this;
                };
                w.do = function(newValue,oldValue) {
                    var value = that.getVariable(name2);
                    w2.process(value,value);
                };
                w.otherwise = w2.otherwise;
                w.anyway = w2.anyway;

                return conditions(w2,actions2);
            }
        };
        return result;
    };

    this.when = function(name) {
        if(!name) return;
        
        var w = when(name);

        whens.push(w);

        return conditions(w,actions(name,w));

    };
};
