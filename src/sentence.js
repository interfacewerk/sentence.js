var Sentence = function() {
    var that = this;

    var privateVariables = {};

    var whens = [];
    
    this.getVariable = function(name) {
        return privateVariables[name];    
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
                if(typeof(w.fctToVerify) === "function" && w.fctToVerify(value, oldValue))
                {
                    w.do && w.do.call(null,value);
                } else {
                    w.otherwise && w.otherwise.call(null,value);
                }
                w.anyway && w.anyway.call(null,value);
            })
        },0);
        return this;
    };

    this.when = function(name) {
        var fctToVerify;
        var w = {
            propertyName: name,
            fctToVerify: function(newValue, oldValue) {
                return fctToVerify ? fctToVerify.call(null,newValue,oldValue) : false;
            },
            do: undefined,
            otherwise: undefined,
            anyway: undefined
        };
        whens.push(w);
        var actions = {
            do: function(fct2) {
                w.do = fct2;
                return this;
            },
            otherwise: function(fct2) {
                w.otherwise = fct2;
                return this;
            },
            anyway: function(fct2) {
                w.anyway = fct2;
                return this;
            }
        };
        return {
            verifies: function(fct2) {
                fctToVerify = fct2;
                return actions;
            },
            is: function(v) {
                fctToVerify = function(value) {
                    return value === v;
                };
                return actions;
            },
            isNot: function(v) {
                fctToVerify = function(value) {
                    return value !== v;
                };
                return actions;
            },
            isDefined: function() {
                fctToVerify = function(value) {
                    return value !== undefined;
                };
                return actions;
            },
            isUndefined: function(v) {
                fctToVerify = function(value) {
                    return value === undefined;
                };
                return actions;
            },
            becomes: function(v) {
                fctToVerify = function(newValue,oldValue) {
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
};
