'use strict';

String.prototype.milliseconds = function() {
    return Number(this);
}

String.prototype.seconds = function() {
	return Number(this)*1000;
}

String.prototype.minutes = function() {
	return Number(this)*60000;
}

String.prototype.hours = function() {
	return Number(this)*3600000;
}
