# reqscraper
Lightweight wrapper for Request and X-Ray JS.


## Sample Usage
This module contains the [`requestJS`](https://github.com/request/request) for making HTTP requests, and [`x-ray`](https://github.com/lapwinglabs/x-ray) for easily scraping websites, called `req` and `scrape` respectively. 

Both return promise. `req` has internal control structure to retry request up to 5 times for failsafe.

#### Brief API doc
- `req(options)`, where `options` is a request options object. See [`requestJS`](https://github.com/request/request) for full detail.

- `scrape(url, selectors, dyn)`, where `url` is the page url, `selectors` is some HTML selectors, `dyn` is the optional boolean to use dynamic scraping, using `x-ray-phantom`. See [`x-ray`](https://github.com/lapwinglabs/x-ray) for full detail.


```Javascript
// imports
var scraper = require(__dirname + '/scraper.js');
var req = scraper.req; // the request module
var scrape = scraper.scrape; // the x-ray module

// sample use of req
var options = {
        method: 'GET',
        url: 'https://www.google.com',
        headers: {
        	'Accept': 'application/json',
        	'Authorization': 'some_auth_details'
        }
    }

// returns the request result in a promise, for chaining
return req(options)
// prints the result
.then(console.log)


// sample use of scrape
return scrape('https://www.google.com', 'body')
// prints the HTML <body> tag
.then(console.log)
```