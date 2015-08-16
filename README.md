# reqscraper
Lightweight wrapper for Request and X-Ray JS.


## Sample Usage
This module contains the [`requestJS`](https://github.com/request/request) for making HTTP requests, and [`x-ray`](https://github.com/lapwinglabs/x-ray) for easily scraping websites, called `req` and `scrape` respectively. 

Both return promise. `req` has internal control structure to retry request up to 5 times for failsafe.

#### Brief API doc
- `req(options)`, where `options` is a request options object. See [`requestJS`](https://github.com/request/request) for full detail.

- `scrape(dyn, url, scope, selector)`, where `dyn` is the optional boolean to use dynamic scraping, using `x-ray-phantom`; `url` is the page url, `scope` and `selector` are some HTML selectors. See [`x-ray`](https://github.com/lapwinglabs/x-ray) for full detail.


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


// sample use of scrape, non-dynamic
return scrape(false, 'https://www.google.com', 'body')
// prints the HTML <body> tag
.then(console.log)

// You can also call it with scope in param #3, and selector in #4
return scrape(false, 'https://www.google.com', 'body', ['li'])
// prints the <li>'s inside the <body> tag
.then(console.log)
```