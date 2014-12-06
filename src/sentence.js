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

    this.remove = function(w) {
        whens.some(function(_w,idx) {
            if(_w.interface === w) {
                whens.splice(idx,1);
                return true;
            }
            return false;
        });
        return this;
    };

    this.when = function(/*name1,name2,name3,...*/) {

        var names = [];

        for(var i = 0; i<arguments.length;i++) {
            names.push(arguments[i]);
        }

        var w = new When(this, names);

        whens.push(w);

        return w.interface;
    };
};

var actions = function(when) {
    return {
        do: function(f) {
            this.and = undefined;
            this.for = undefined;
            when.do = f;
            return this;
        },
        anyway: function(f) {
            this.and = undefined;
            this.for = undefined;
            when.anyway = f;
            return this;
        },
        otherwise: function(f) {
            this.and = undefined;
            this.for = undefined;
            when.otherwise = f;
            return this;
        },
        and: function() {
            var names = [];
            for(var i=0; i < arguments.length; i++) {
                names.push(arguments[i]);
            }
            return when.onAnd(names);
        },
        // the 'do' will be executed
        // if conditions are met for 'duration' milliseconds 
        // NB: a timeout is set the first time conditions are met
        // and cleared when the are not anymore
        for: function(duration) { // in milliseconds
            this.and = undefined;
            when.for = duration;
            return this;
        }
    };
};

var conditions = function(when, names, callback) {
    if(names.length === 1) {
        var name = names[0];
        return {
            verifies: function(fct2) {
                callback(fct2);
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

var When = function(sentence, names) {
    var that = this;
    var variables = [];

    that.onVariable = function(n) {
        if(variables.indexOf(n) === -1) {
            variables.push(n);
        }
        return that;
    }

    var lastVariables = names;

    that.onAnd = function(namesAnd) {
        namesAnd = namesAnd.length === 0 ? lastVariables : namesAnd;
        lastVariables = namesAnd;
        namesAnd.forEach(function(name){
            that.onVariable(name);
        });
        return conditions(
            that, 
            namesAnd, 
            function(f) {
                var oldToVerify = that.toVerify;
                that.toVerify = function(newValues,oldValues) {
                    function verifyF() {
                        if(namesAnd.length === 1) {
                            return f.call(null, newValues, oldValues);
                        } else {
                            var filteredNew = {};
                            var filteredOld = {};
                            namesAnd.forEach(function(name){
                                filteredNew[name] = newValues[name];
                                filteredOld[name] = oldValues[name]; 
                            });
                            return f.call(null, filteredNew, filteredOld);
                        }
                    }
                    return oldToVerify.call(null, newValues, oldValues) && verifyF();
                }
            }
        );
    };

    that.do = undefined;
    that.otherwise = undefined;
    that.anyway = undefined;

    names.forEach(function(name){
        that.onVariable(name);
    });

    that.interface = conditions(
        that, 
        names, 
        function(f) {
            that.toVerify = function(newValues,oldValues) {
                return f.call(null,newValues,oldValues);
            }
        }
    );

    function doTheDo(nameVariables, newValues, oldValues) {
        try {
            that.do && that.do.call(null, newValues, oldValues);
        } catch(e) {
            console.error("sentence.js: error on do for " + nameVariables);
        }
    }

    that.for = undefined;
    var verifiedTimeout;
    that.process = function(nameVariables, newValues,oldValues) {
        if(!variables.some(function(variable){
            return nameVariables.indexOf(variable) !== -1; })) {
            return that;
        }
        if(that.toVerify && that.toVerify.call(null, newValues, oldValues)) {
            if(that.for !== undefined) {
                if(!verifiedTimeout) {
                    verifiedTimeout = setTimeout(function() {
                        verifiedTimeout = undefined;
                        doTheDo(); // we don't provide the values in this case!
                    } ,that.for);
                }
            } else {
                doTheDo(nameVariables, newValues, oldValues);
            }
        } else {
            try {
                if(that.for !== undefined) {
                    if(verifiedTimeout) {
                        clearTimeout(verifiedTimeout);
                        verifiedTimeout = undefined;
                    }
                }
                that.otherwise && that.otherwise.call(null, newValues, oldValues);
            } 
            catch(e) {
                console.error("sentence.js: error on otherwise for " + nameVariables);
            }
        }
        try {
            that.anyway && that.anyway.call(null, newValues, oldValues);} 
        catch(e) {
            console.error("sentence.js: error on anyway for " + nameVariables);
        }
        return that;
    }
};
