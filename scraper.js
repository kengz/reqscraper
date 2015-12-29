////////////////////////////////
// The generic scraper module //
////////////////////////////////
// contains: 
// 1. HTTP request mod
// 2. generic scraper: use x, dx with html selector targetting
// 3. Both functions return promise for chaining and flow control.

// dependencies
var _ = require('lodash')
var Promise = require('bluebird');
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
    var defer = Promise.defer();
    retry(options, defer, 5);
    return defer.promise;
}

// // sample use of req
// var options = {
//         method: 'GET',
//         url: 'https://www.google.com',
//         headers: {
//             'Accept': 'application/json',
//             'Authorization': 'some_auth_details'
//         }
//     }

// // returns the request result in a promise, for chaining
// return req(options)
// // prints the result
// .then(console.log)
// .catch(console.log)


// the recursive retry request() function
// callback for request JS 
  // the recursive retry request() function
  function retry(options, defer, times) {
    // bind the defer object to cb
    request(options, function(err, res, body)
    {
        if (!err && res) {
            if (res.statusCode == 200) {
                defer.resolve(body);
            } else {
                defer.reject(res.statusCode)
            }
        }
        else {
            console.log(err);
            if (times--) retry(options, defer, times);
            // if err, reject
            else defer.reject(err);
        }
    });
}

/////////////////////////////////
// Generic scraper using x-ray //
/////////////////////////////////

// Scrapes a url with html selectors.
// If dyn == true, use a dynamic scraper dx.
// Returns a promise.
function scrape(dyn, url, scope, selector) {
    var defer = Promise.defer();
    var scraper = dyn ? dx : x;
    scraper(url, scope, selector)(function(err, res){
        defer.resolve(res);
    })
    return defer.promise;
}
// // sample use of scrape, non-dynamic
// return scrape(false, 'https://www.google.com', 'body')
// // prints the HTML <body> tag
// .then(console.log)

// // You can also call it with scope in param #3, and selector in #4
// return scrape(false, 'https://www.google.com', 'body', ['li'])
// // prints the <li>'s inside the <body> tag
// .then(console.log)

///////////////////////////////////////////
// Generic scraper extended with crawler //
///////////////////////////////////////////


// helper: content grabber for xs, signed with the page url
function grab(url, content) {
    // make sure hrefs is an array even if is singleton
    var hrefsAsArray = _.isArray(content.hrefs) ? content.hrefs : [content.hrefs]
    return {
        url: url,
        content: _.omit(content, 'hrefs'),
        hrefs: hrefsAsArray,
        child: {}
    }
}

// Basically many x's
// Calls x(url, selector) for each url in urlArr
// returns a promise of object {url, content}
function xs(dyn, urlArr, selector, limit) {
    dyn = dyn || false
    var x = scrape.bind(null, dyn)
    // limit the urlArr size for crawling
    if (limit > 0) urlArr = _.take(urlArr, limit)
        console.log("urlArr is", urlArr)
    var promises = []
    _.each(urlArr, function(url) {
        var defer = new Promise(function (resolve, reject){
            x(url, selector)
            .then(grab.bind(null, url))
            .then(resolve)
            .catch(reject)
        })
        promises.push(defer)
    })
    return Promise.all(promises)
}

// // sample call, non dynamic scraper
// xs(false, 
//     ['https://www.google.com'], {
//         res: ['a'],
//         hrefs: ['a@href']
//     }, 5)
// .then(function(roar){
//     console.log(roar)
//     console.log(roar[0].hrefs)
// })


// recursively call xs()
// extend obj by adding to obj.child the results from urlArr and selector, then recursively crawl from the children using the tailArr
// where tailArr = array of selectors for the next crawled depths, with the first entry consumed per descend
function rxs(dyn, obj, urlArr, selector, tailArr, limit) {
    // console.log('reporting')
    var defer = Promise.defer()

    // call xs() on all the urlArr, returns promise from grab()
    xs(dyn, urlArr, selector, limit)
    .then(function(grabbed){
        // set child as result from grab()
        obj.child = grabbed
        // console.log('grabbed', grabbed, obj.child)
    
        var promises = []
        // recursive part on each child
        _.map(obj.child, function(o){
            // console.log("obj child", o)
            var deferG = new Promise(function (resolve, reject) {

                // if x's is callable
                var expectGChild = !_.isEmpty(_.compact(tailArr)) && !_.isEmpty(_.compact(o.hrefs))
                // console.log('expectGChild', expectGChild)
                if (expectGChild) {
                    var hrefs = o.hrefs
                    var newTailArr = _.clone(tailArr)
                    var newSelector = newTailArr.shift()

                    // recursive call
                    rxs(dyn, o, hrefs, newSelector, newTailArr, limit)
                    .then(resolve)
                    .catch(reject)
                }
                else {
                    resolve()
                }
            })
            promises.push(deferG)
        })

        // resolve promise for all child
        Promise.all(promises)
        .then(function(res){
            // console.log('res',res)
            // attach obj to the highest defer, bubble up
            defer.resolve(obj)
        })
        .catch(defer.reject)
    })
    return defer.promise
}



// scraper that can crawl
// Note that to crawl, each higher level of selector must have the 'hfres' selector specified
function scrapeCrawl(dyn, url, selector, tailArr, limit) {
    var defer = Promise.defer()

    // the scraped result as object
    var res = {}

    // the (base) url array
    var urlArr = _.isArray(url) ? url : [url]

    // call recursie x's and put result thru defer's promise
    rxs(dyn, res, urlArr, selector, tailArr, limit)
    .then(function(meh){
        // console.log(JSON.stringify(meh))
        defer.resolve(meh)
    })
    .catch(defer.reject)

    return defer.promise
}


// // sample call
// // static scrape-crawler
// var sc = scrapeCrawl.bind(null, false)

// // base selector, level 0
// // has attribute `hrefs` for crawling next
// var selector0 = {
//     img: ['.dribbble-img'],
//     h1: ['h1'],
//     hrefs: ['.next_page@href']
// }

// // has attribute `hrefs` for crawling
// var selector1 = {
//     h1: ['h1'],
//     hrefs: ['.next_page@href']
// }
// // the last selector where crawling ends; no need for `hrefs`
// var selector2 = {
//     h1: ['h1']
// }

// // Sample call of the method
// sc(
//     'https://dribbble.com', 
//     selector0,
//     // crawl for 3 more times before stoppping at the 4th level
//     [selector1, selector1, selector1, selector2],
//     3
//     )
// .then(function(res){
//     // prints the result
//     console.log(JSON.stringify(res, null, 2))
// })
// .catch(console.log)


// exporting HTTP req and scrape, scrapeCrawl
module.exports = {
    req: req,
    scrape: scrape,
    scrapeCrawl: scrapeCrawl
}
