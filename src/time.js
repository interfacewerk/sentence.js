'use strict';

String.prototype.milliseconds = function() {
    return Number(this);
}

String.prototype.seconds = function() {
	return Number(this)*1e3;
}

String.prototype.minutes = function() {
	return Number(this)*6e4;
}

String.prototype.hours = function() {
	return Number(this)*36e5;
}
