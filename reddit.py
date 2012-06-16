import feedparser, sys, re
from BeautifulSoup import BeautifulSoup

if len(sys.argv) < 3:
    print "Usage: python reddit.py [number of pages] [subreddits]"
    exit()

class SubRedditParser:
    def __init__(self, reddit, count):
        self.reddit = reddit
        self.count = count
        self.result = "name,url"
        self.after = ""

    def parseUrl(self,url):
        print str(len(self.result.split("\n")) - 1) + " videos found so far..."
        print "Fetching " + url

        feed = feedparser.parse(url)
        last_item = None

        for item in feed['entries']:
            description = BeautifulSoup(item.description)
            for a in description.findAll('a') :
                if (len(a.contents) > 0 and a.contents[0] == '[link]') :
                    href = a['href']
                    if (re.match('https?\:\/\/(www.)?youtu(\.be|be\.com)', href)):
                        self.result = self.result + "\n" + item.title.replace(',', '').replace('"', '') + ',' + href
            last_item = item

        new_after = self.after
        if (not last_item == None):
            new_after = re.search('comments/([a-zA-Z0-9]*)/', last_item.link).groups(1)[0]
        if (new_after == self.after):
            return True

        self.after = new_after
        return False

    def parse(self):
        for i in range(0,self.count):
            url = "http://www.reddit.com/r/" + self.reddit + ".rss?after=t3_" + self.after
            if(self.parseUrl(url)):
                print "No more pages to get"
                break

        f = open(self.reddit + '.csv',"w")
        f.write(self.result.encode('ascii', 'ignore'))
        f.close()

i = 0
for arg in sys.argv:
    if i >= 2:
        s = SubRedditParser(arg, int(sys.argv[1]))
        s.parse()
    i = i + 1