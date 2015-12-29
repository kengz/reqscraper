# reqscraper
Lightweight wrapper for Request and X-Ray JS.


## Sample Usage
This module contains the [`requestJS`](https://github.com/request/request) for making HTTP requests, and [`x-ray`](https://github.com/lapwinglabs/x-ray) for easily scraping websites, called `req` and `scrape` respectively. 

Both return promise. `req` has internal control structure to retry request up to 5 times for failsafe.

#### Brief API doc
- `req(options)`, where `options` is a request options object. See [`requestJS`](https://github.com/request/request) for full detail.

- `scrape(dyn, url, scope, selector)`, where `dyn` is the boolean to use dynamic scraping using `x-ray-phantom`; `url` is the page url, `scope` and `selector` are some HTML selectors. See [`x-ray`](https://github.com/lapwinglabs/x-ray) for full detail.

- `scrapeCrawl(dyn, url, selector, tailArr, [limit])`, where `dyn` is true for dynamic scraping using `x-ray-phantom`;

#### `req(options)`
Convenient wrapper for `request js` - HTTP request method that returns a promise.

| param | desc |
|:---|:---|
| `options` | A `request` options object. See [`requestJS`](https://github.com/request/request) for full detail. |


```Javascript
// imports
var scraper = require('reqscraper');
var req = scraper.req; // the request module

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
// prints the error if thrown
.catch(console.log)

```

#### `scrape(dyn, url, scope, selector)`
Scraper that returns a promise. Backed by [`x-ray`](https://github.com/lapwinglabs/x-ray).

| param | desc |
|:---|:---|
| `dyn` | the boolean to use dynamic scraping using `x-ray-phantom` |
| `url` | the page url to scrape |
| `[scope]` | Optional scope to narrow now the target HTML for selector |
| `selector` | HTML selector. See [`x-ray`](https://github.com/lapwinglabs/x-ray) for full detail. |

```Javascript
// imports
var scraper = require('reqscraper');
var scrape = scraper.scrape; // the scraper

// sample use of scrape, non-dynamic
return scrape(false, 'https://www.google.com', 'body')
// prints the HTML <body> tag
.then(console.log)

// You can also call it with scope in param #3, and selector in #4
return scrape(false, 'https://www.google.com', 'body', ['li'])
// prints the <li>'s inside the <body> tag
.then(console.log)
```


#### `scrapeCrawl(dyn, url, selector, tailArr)`
An extension of `scrape` above with crawling capability. Returns a promise with results in a tree-like JSON structure. Crawls by a breath-first tree structure, and does not crawl deeper if the root of a branch is not crawlable.

| param | desc |
|:---|:---|
| `dyn` | the boolean to use dynamic scraping using `x-ray-phantom` |
| `url` | the base page url to scrape and crawl from |
| `selector` | The selector for the base page (first level) |
| `tailArr` | An array of selectors for each level to crawl. Note that a preceeding selector must specify the urls to crawl via `hrefs`. |
| `[limit]` | An optional integer to limit the number of children crawled at every level. |


```Javascript
// imports
var scraper = require('reqscraper');
var scrapeCrawl = scraper.scrapeCrawl; // the scrape-crawler

// dynamic scraper
var dc = scrapeCrawl.bind(null, true)
// static scraper
var sc = scrapeCrawl.bind(null, false)

// sample use of scrape-crawl, static

// base selector, level 0
// has attribute `hrefs` for crawling next
var selector0 = {
    img: ['.dribbble-img'],
    h1: ['h1'],
    hrefs: ['.next_page@href']
}

// has attribute `hrefs` for crawling
var selector1 = {
    h1: ['h1'],
    hrefs: ['.next_page@href']
}
// the last selector where crawling ends; no need for `hrefs`
var selector2 = {
    h1: ['h1']
}

// Sample call of the method
sc(
    'https://dribbble.com', 
    selector0,
    // crawl for 3 more times before stoppping at the 4th level
    [selector1, selector1, selector1, selector2]
    )
.then(function(res){
    // prints the result
    console.log(JSON.stringify(res, null, 2))
})


// Same as above, but with a limit on how many children should be crawled (3 below)
sc(
    'https://dribbble.com', 
    selector0,
    // crawl for 3 more times before stoppping at the 4th level
    [selector1, selector1, selector1, selector2],
    3
    )
.then(function(res){
    // prints the result
    console.log(JSON.stringify(res, null, 2))
})
```


## Changelog

`Aug 18 2015`
- Added scrapecrawl, basically a scraper extended from `scrape` that can also crawl.
- Updated README for better API doc.