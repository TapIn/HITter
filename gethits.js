/*
 * List of problems with phantomjs, as I find them:
 *     [0] It tries to set the font size in webkit to a negative size.
 *     [1] If there's a syntax error, it will just sit there without saying anything.
 *     [2] As a result of [1], it is impossible to tell where you have a syntax error.
 *     [3] Sometimes, it will just sit there without saying anything for other types of errors.
 *     [4] There is no way to block until page loads, but you can block until virtually any other event.
 *     [5] It sometimes calls the page load functions more than once, however console.log is ignored in any
 *         of these additional calls, so it's impossible to debug. This is a known bug.
 *     [6] Attempting to access a property of an undefined variable is covered under [3].
 *     [7] WebPage is not associated with a URL. There doesn't seem to be any way to get the current URL
 *         from WebPage. This isn't a real issue with closures, but it's still stupid.
 *     [8] Sometimes var = let. I haven't figured out exactly what triggers this.
 */

var system = require('system');
if (phantom.args.length < 2) {
    console.log("Usage: phantomjs gethits.js [number] [search term]");
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
                if (!hasProcessed) { // We need this because phantomjs is a total piece of shit [5]
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
        var sanTitle = videos[i]['title'].replace(',', ' ');
        toWrite += sanTitle + "," + videos[i]['url'] + "\n";
    }

    fs.write(name, toWrite, 'w');
}

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