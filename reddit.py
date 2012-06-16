import feedparser, sys, re
from BeautifulSoup import BeautifulSoup

if len(sys.argv) < 3:
    print "Usage: python reddit.py [number of pages] [subreddit]"
    exit()

result = ""
after = ""

def parseUrl(url):
    global result
    global after
    print "Fetching " + url

    feed = feedparser.parse(url)

    for item in feed['entries']:
        description = BeautifulSoup(item.description)
        for a in description.findAll('a') :
            if (a.contents[0] == '[link]') :
                href = a['href']
                if (re.match('https?\:\/\/(www.)?youtu(\.be|be\.com)', href)):
                    result = result + "\n" + item.title.replace(',', '').replace('"', '') + ',' + href
                    after = re.search('comments/([a-zA-Z0-9]*)/', item.guid).groups(1)[0]

for i in range(0,int(sys.argv[1])):
    url = "http://www.reddit.com/r/" + sys.argv[2] + ".rss?after=t3_" + after
    parseUrl(url)

f = open(sys.argv[2] + '.csv',"w")
f.write(result.encode('ascii', 'ignore'))
f.close()