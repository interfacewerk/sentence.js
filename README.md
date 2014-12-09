sentence.js
===========

## Why?
Sentence.js is a library which aims at helping you writing understandable and maintainable code.

## Where and when?
Whereever and whenever, you have state-machines and many variables and you want to execute functions according to your variables values.

## How?
With sentence.js, you define a scope for variables, called a ```Sentence```. Each ```sentence``` has its own scope of variables. A ```Sentence``` can be seen as a state machine. You can define functions to execute when some conditions are fulfilled by the scope of variables.

## In practice
Let's consider a simple example. You have a variable ```x``` and if it takes the value ```200```, you want to execute a function ```something```.

With sentence.js, you program this as you would say it!

```
mySentence.when("x").is(200).do(something);
```

or

```
mySentence.when("x").verifies(function(x, oldX) { return x===oldX+2; }).do(somethingElse); 
```

### How to create a `sentence`?

```
var mySentence = new Sentence();
```

### Variables in the `sentence` scope

You can set variables in your `sentence` scope:
```
mySentence.set(
    "x",1,
    "y",2,
    "z",3
);
```
Or
```
mySentence.set({
    x: 1,
    y: 2,
    z: 3
});
```

You can get the value of a variable of your `sentence` scope.
To retrieve a single value:
```
mySentence.get("x");
```
To retrieve multiple values:
```
var values = mySentence.get("x","y","z");
console.log(values.x + " " + values.y + " " + values.z);
```

### Trigger actions
```when``` is the core concept behind sentence.js. With ``when``you can trigger a function when a condition is fulfilled by variables of your `sentence`.

To create a `when` from your `sentence`, you specify the name of variables used by your condition:

```
var myWhen = mySentence.when("x","y");
```

`myWhen` is an object containing one method: `verify`. `verify` is a function which expects a condition function: it should return `true` or `false`.

```
mySentence.when("x","y").verify(function(x,y,oldX,oldY){
    return x === y && x === oldX;
});
```

sentence.js provides values of variables requested by the ```when```automatically! If your `when` requested `x` and `y`, the condition function you give in `verify` will receive `x,y,oldX,oldY` as arguments.

The result of `mySentence.when(...).verify(...)` is an object with 5 methods:

* `do`, `otherwise` and `'anyway`:  they expect a function which will be executed depending on the condition function result. `do` will be executed if the condition function returns `true` and `otherwise` otherwise. `anyway` is executed anyway.

* `and` is a function which enables you to add more conditions to fulfill in your `when`. It will be described in more details after.

* `for` enables you to wait before executing the `do` if the conditions are fulfilled. It will also be described in more details after.

Basically, everytime a variable changes in the sentence, the following process is executed:

0. `mySentence.set("x",1,"y",2);`
1. for each **concerned** `when` in the sentence
2. execute the condition function:
2.1 if the condition returned true, execute the `do`
2.2 otherwise execute the `otherwise`
2.3 execute the `anyway`

`do`, `otherwise` and `anyway` are methods which expect function as argument. The function passed will receive the new scope with all variables within the sentence and the old scope.

```
mySentence
.when("x","y")
.verify(function(x,y,oldX,oldY){return x === y;})
.do(function(newScope, oldScope){
    console.log(newScope.x + " " + newScope.y);
})
.otherwise(something).anyway(somethingElse);
```

### Condition function helpers
sentence.js provide several condition function helpers which really enables you to write concise code like:

```
mySentence.when("x").becomes(0).do(something);
```

instead of:

```
mySentence.when("x")
.verify(function(x,oldX) {
    return x === 0 && x !== oldX;
})
.do(something);
```

sentence.js provides helpers only for condition on one variable:

* `is(value)`: to verify that the variable is equal to `value`
* `isNot(value)`: to verify that the variable is not equal to `value`
* `isDefined()`: to verify that the variable is defined
* `isUndefined()`: to verify that the variable is undefined
* `becomes(value)`: to verify that the variable just became equal to `value`
* `verifies(function(x,oldX){...})`: equivalent to verify, but grammatically correct ;)

### About `.and()`
`.and()` provides a mechanism to extend the condition function of a `when`. It works exactly the same. You give as arguments the names of variables to give to the condition function.

The second mechanism is the `.and()` function. Example:

```
mySentence
.when("x").is(0)
.and("y","z")
.verify(function(y,z){return x!==y;})
.do(something);
```

### About `.for()`
You might want to execute a function after n seconds some conditions are met. You would naturally do something like this:

```
var myTimeout;
mySentence.when("x").is(200)
.do(function() {
	if(myTimeout === undefined) {
		myTimeout = setTimeout(function(){
			myTimeout = undefined;
			doSomething();
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
mySentence.when("x").becomes(200)
.for(10*1000)
.do(something);
```

The function in the do will be executed 10 seconds after `x` becomes 200.
Even better, to avoid writing awful things like `60*60*1000` (one hour), you can a much more intuitive syntax:

```
mySentence.when("x").becomes(200)
.for("1".hours())
.do(something);
```

Similarly, you can use:

* `"10".milliseconds()`
* `"10".seconds()`
* `"10".minutes()`
* `"10".hours()`
* `"10".days()`
* `"10".weeks()`

### `says.that(...).is(...)` : how to write a statement

Imagine that you have three variables, `x`, `y` and `sumXY`. Imagine that every time you change `x` or `y`, you want to change `sumXY` to be `x+y`. With sentence.js, you simply write:

```
mySentence.says
.that("sumXY")
.is("x", "y", function(x,y) {
    return x+y;
});
```

The variables `x`, `y` and `sumXY` are created in the scope of `mySentence` if necessary. Every time `x` or `y` is changed, the function passed as last argument in `is` is evaluated and the returned value assigned to `sumXY`. The function passed as last argument receives the same arguments as a condition function would.

```
mySentence.says
.that("sumXY")
.is("x", "y", function(x,y,oldX,oldY) {
    return ...
});
```

To remove a statement, you simply write:

```
var myStatement = mySentence.says
.that(...)
.is(...);

myStatement.remove();
```