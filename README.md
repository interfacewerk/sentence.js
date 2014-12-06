sentence.js
===========

Sentence.js is a small library which purpose is to help you writing easily understandable and maintainable code.

Let's consider a simple example. You have a variable ```x``` and if it takes the value ```200```, you want to execute a function ```something```.

With sentence.js, you program this as you would say it!

```
mySentence.when("x").is(200).do(something);
```

or

```
mySentence.when("x").verifies(function(x) { return x%2===0; }).do(somethingElse); 
```

You can write as many ```when``` as you want with the same ```Sentence``` object. To set the value of a variable of a ```Sentence```, you simply write:

```
mySentence.set("x",value);
```

All the ```when``` you put into ```mySentence``` will then be verified and actions executed automatically.

You might want to execute a function after n seconds some conditions are met. You would naturally do something like this:

```
var myTimeout;
mySentence.when("x").is(200)
.do(function() {
	if(myTimeout === undefined) {
		myTimeout = setTimeout(function(){
			myTimeout = undefined;
			//
			//
			// YOUR real do here
			//
			//
		}, 10*1000);
	}
})
.otherwise(function(){
	clearTimeout(myTimeout);
	myTimeout = undefined;
});
```

sentence.js embeds this mechanism in .for(). Then, your code looks like this:

```
mySentence.when("x").is(200)
.for(10*1000)
.do(function() {
			//
			//
			// YOUR real do here
			//
			//
});
```