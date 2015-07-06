////////////////////////////////
// The generic scraper module //
////////////////////////////////
// contains: 
// 1. HTTP request mod
// 2. generic scraper: use x, dx with html selector targetting
// 3. Both functions return promise for chaining and flow control.

// dependencies
var q = require('q');
var request = require('request');
var Xray = require('x-ray');
var phantom = require('x-ray-phantom');

// web scrapers, static and dynamic (with phantomjs driver)
var x = Xray();
var dx = Xray().driver(phantom());

//////////////////////////////////////////////
// HTTP request with retry using request JS //
//////////////////////////////////////////////

// try HTTP request retry up to 5 times; 
// returns a promise
function req(options) {
    var defer = q.defer();
    retry(options, defer, 5);
    return defer.promise;
}
// the recursive retry request() function
function retry(options, defer, times) {
    try {
        // bind the defer object to cb
        request(options, cb.bind(defer))
    }
    catch (err) {
        if (times--) retry(options, defer, times);
        // if err, reject
        else defer.reject(err);
    }
}
// callback for request JS 
// binded with q.defer from req() to resolve(body)
function cb(err, res, body){
    if (!err && res.statusCode == 200)
        this.resolve(body)
    else {
        console.log(err, res.statusCode, body);
        throw err;
    }
}

/////////////////////////////////
// Generic scraper using x-ray //
/////////////////////////////////

// Scrapes a url with html selectors.
// If dyn == true, use a dynamic scraper dx.
// Returns a promise.
function scrape(url, selectors, dyn) {
    var defer = q.defer();
    var scraper = dyn ? dx : x;
    scraper(url, selectors)(function(err, res){
        defer.resolve(res);
    })
    return defer.promise;
}

// exporting HTTP req and scrape
module.exports = {
    req: req,
    scrape: scrape
}
