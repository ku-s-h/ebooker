#!/usr/bin/env node

var colors = require('colors');
var readline = require('readline');
var open = require('open');
var Promise = require('bluebird');
// Promises...Promises...
var request = Promise.promisify(require('request'));
var opt = '';
var check;

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Read the command line arguments
process.argv.forEach(function(val, index, array) {
	if (index >= 2) {
		opt += val + ' ';
	}
});
//make the API request
request('http://it-ebooks-api.info/v1/search/' + opt.trim()).spread(function(response, body) {
	return JSON.parse(body);
}).then(function(s) {
	if (s.Total == '0') {
		// No books found!!
		throw "OOPS!! NO ITEMS FOUND";
	}
	var i = 0;
	(s.Books).forEach(function(book) {
		console.log(colors.red(i+1)+colors.red(". ")+colors.bold(book.Title));
		if (book.SubTitle == null) {
			console.log("** No description available **");
		} else {
			console.log(book.SubTitle);
		}
		i++;
		console.log();
		check = i;
	});
	return s;
}).then(function(data) {
	rl.question(colors.cyanBG('Enter the option number of the book you want to download:') +'\n', function(result) {
		// Check if option entered is valid or not
		if (!(parseInt(result) > 0 && parseInt(result) <= (check+1) && parseInt(result) == parseFloat(result))) {
			console.log('PLEASE ENTER A VALID OPTION!!!');
			process.exit(1);
		}
		request('http://it-ebooks-api.info/v1/book/'+(data).Books[(result)-1].ID).spread(function (response, body) {
			return (JSON.parse(body)).Download;
		}).then(function(val) {
			open(val);
		}).catch(function(err) {
			if ((err.message) == 'getaddrinfo ENOTFOUND') {
				console.log(colors.redBG("ERROR: NO INTERNET CONNECTIVITY"));
				process.exit(1);
			} else {
				console.log(err);
			}
		});
	rl.close();
	});
}).catch(function(err) {
	if ((err.message) == 'getaddrinfo ENOTFOUND') {
			console.log(colors.redBG("ERROR: NO INTERNET CONNECTIVITY"));
			process.exit(1);
	} else {
		console.log(colors.blackBG(err));
		process.exit(1);
	}
});