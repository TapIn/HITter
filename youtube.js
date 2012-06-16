var system = require('system');
if (phantom.args.length < 2) {
    console.log("Usage: phantomjs youtube.js [number] [search term]");
    phantom.exit();
}

var countPages = phantom.args[0];
var terms = [];
for (var i in phantom.args) {
    if (i == 0) {
        continue;
    }

    terms.push(phantom.args[i]);
}

var YouTubeSearch = function(terms, n)
{
    var page = new WebPage();
    var url = 'http://www.youtube.com/results?search_query=';

    var hasProcessed = false;

    var getResult = function()
    {
        result = page.evaluate(function(){
            _videos = [];
            jQuery(".yt-uix-tile-link").each(function(){
                _videos.push({title: jQuery(this).text(), url: this.href});
            });
            return _videos;
        });
        return result;
    }

    this.process = function(callback)
    {
        console.log("Hitting " + url);
        page.open(url, function (status) {
            page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
                // Phantomjs will sometimes call this method multiple times. This is a known bug (#353). We
                // need to check if it's already been called before processing it. As a side note, this was
                // incredibly difficult to debug, since console.log calls in subsequent calls don't show up.
                if (!hasProcessed) {
                    hasProcessed = true;
                    var hit = getResult();
                    callback(hit);
                }
            });
        });
    }

    this.constructor = function(terms, n){
        for (var i in terms) {
            url += terms[i] + "+";
        }
        url = url.substring(0, url.length - 1);
        url += "&page=" + n;
    }
    this.constructor(terms, n);
}

var videos = [];
var writeToFile = function()
{
    console.log("Writing to file");
    var fs = require('fs');
    var name = "";

    for (var i in terms) {
        name += terms[i] + "-";
    }
    name = name.substring(0, name.length - 1) + '.csv';

    console.log("->" + name);

    var toWrite = "name,url\n";
    for (var i in videos) {
        if (videos[i]['url'].substr(22,9) == '/redirect') {
            continue;
        }
        var sanTitle = videos[i]['title'].replace(/[\,\"]/g, ' '); // Mturk doesn't allow quotes in CSVs
        toWrite += sanTitle + ',' + videos[i]['url'] + "\n";
    }

    fs.write(name, toWrite, 'w');
}

// Use a recursive iterator because there's no way to block on page load.
var spawnPageScraper = function(number) {
    console.log("[" + number + "/" + countPages + "]");
    var searchPage = new YouTubeSearch(terms, number);
    searchPage.process(function(content){
        videos = videos.concat(content);
        if (number == countPages) {
            writeToFile();
            phantom.exit();
        } else {
            spawnPageScraper(number + 1);
        }
    });
}

spawnPageScraper(1);