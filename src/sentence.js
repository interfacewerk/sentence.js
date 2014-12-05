'use strict';

var Sentence = function() {
    var that = this;

    var privateVariables = {};

    var whens = [];

    that.get = function(name) {
        return privateVariables[name];    
    };

    this.set = function(name, value) {
        var oldValues = JSON.parse(JSON.stringify(privateVariables));
        privateVariables[name] = value;
        setTimeout(function() {
            var newValues = privateVariables;
            whens.forEach(function(w) {
                try {
                    w.process(name, newValues, oldValues);
                } catch(e) {
                    console.error("sentence.js: an error occured when processing a when")
                }
            });
        },0);
        return this;
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

    this.when = function(name) {
        if(!name) return;

        var w = new When(this, name);

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
        and: function(name) {
            return when.onAnd(name);
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

var conditions = function(when, name, callback) {
    return {
        verifies: function(fct2) {
            callback(fct2);
            return actions(when);
        },
        is: function(v) {
            callback(function(newValue,oldValue){
                return newValue === v;
            });
            return actions(when);
        },
        isNot: function(v) {
            callback(function(newValue,oldValue){
                return newValue !== v;
            });
            return actions(when);
        },
        isDefined: function() {
            callback(function(newValue,oldValue){
                return newValue !== undefined;
            });
            return actions(when);
        },
        isUndefined: function() {
            callback(function(newValue,oldValue){
                return newValue === undefined;
            });
            return actions(when);
        },
        becomes: function(v) {
            callback(function(newValue,oldValue){
                return newValue === v && newValue !== oldValue;
            });
            return actions(when);
        },
    };
};

var When = function(sentence, name) {
    var that = this;
    var variables = [];

    that.onVariable = function(n) {
        if(variables.indexOf(n) === -1) {
            variables.push(n);
        }
        return that;
    }

    var lastVariable = name;

    that.onAnd = function(nameAnd) {
        nameAnd = nameAnd || lastVariable;
        lastVariable = nameAnd;
        that.onVariable(nameAnd);
        return conditions(
            that, 
            nameAnd, 
            function(f) {
                var oldToVerify = that.toVerify;
                that.toVerify = function(newValues,oldValues) {
                    return oldToVerify.call(null,newValues,oldValues) && f.call(null,newValues[nameAnd],oldValues[nameAnd]);
                }
            }
        );
    };

    that.do = undefined;
    that.otherwise = undefined;
    that.anyway = undefined;

    that.onVariable(name);

    that.interface = conditions(
        that, 
        name, 
        function(f) {
            that.toVerify = function(newValues,oldValues) {
                return f.call(null,newValues[name],oldValues[name]);
            }
        }
    );

    function doTheDo(nameVariable, newValues, oldValues) {
        try {
            that.do && that.do.call(null, newValues, oldValues);
        } catch(e) {
            console.error("sentence.js: error on do for " + nameVariable);
        }
    }

    function doTheOtherwise(nameVariable, newValues, oldValues) {
        that.otherwise && that.otherwise.call(null, newValues, oldValues);
    }

    that.for = undefined;
    var verifiedTimeout;
    that.process = function(nameVariable, newValues,oldValues) {
        if(variables.indexOf(nameVariable) === -1) return that;
        if(that.toVerify && that.toVerify.call(null, newValues, oldValues)) {
            if(that.for !== undefined) {
                if(!verifiedTimeout) {
                    verifiedTimeout = setTimeout(function() {
                        verifiedTimeout = undefined;
                        doTheDo(); // we don't provide the values in this case!
                    } ,that.for);
                }
            } else {
                doTheDo(nameVariable, newValues, oldValues);
            }
        } else {
            try {
                if(that.for !== undefined) {
                    if(verifiedTimeout) {
                        clearTimeout(verifiedTimeout);
                        verifiedTimeout = undefined;
                    }
                }
                doTheOtherwise();
            } 
            catch(e) {
                console.error("sentence.js: error on otherwise for " + nameVariable);
            }
        }
        try {
            that.anyway && that.anyway.call(null, newValues, oldValues);} 
        catch(e) {
            console.error("sentence.js: error on anyway for " + nameVariable);
        }
        return that;
    }

};
