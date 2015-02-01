'use strict';

var When = function(sentence, names) {
    var that = this;
    var variables = [];
	
	that.remove = function () {
		sentence._remove(that);
	};
	
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

	that.interface.processWithOldValues = function (oldValues) {
		var newValues = {};
		var nameVariables = [];
		for(var key in oldValues) {
			nameVariables.push(key);
			newValues[key] = sentence.get(key);
		}
		that.process(nameVariables, newValues, oldValues);
		return that.interface;
	};
	
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
