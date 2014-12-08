'use strict';

function That(sentence, name) {
    var that = this;
    var theWhen;
    
    var fIs;
    
    function onVerify() {
        sentence.set(
            name, 
            fIs.apply(null, Array.prototype.slice.call(arguments))
        );
    }

    that.is = function(/*name1,name2,name3,...,valueFct*/) {
        var names = Array.prototype.slice.call(arguments).slice(0,arguments.length-1);

        fIs = arguments[arguments.length-1];

        theWhen = (sentence.when.apply(sentence, names));
        theWhen.verify(onVerify);
        
        return that;
    }
    
    that.remove = function() {
        sentence.remove(theWhen);
        return that;
    }
}