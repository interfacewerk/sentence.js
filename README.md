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
