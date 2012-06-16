HITter
======
An application to generate Amazon Mechanical Turk HITs from various sources

YouTube
-------
 1. Download and install phantomjs from http://code.google.com/p/phantomjs/downloads/list
 2. Run `phantomjs youtube.js [number of pages to get] [search terms]` (Search terms don't need to be quoted.)
 3. Pick up your results. It's the .csv file in the same directory.

 Reddit
 ------
  1. Install python, python-feedparser, and python-beautifulsoup
  2. Run `python reddit.py [number of pages to get] [subreddits]` (subreddits is a space-delimited list)
  3. Pick up your results. It's the .csv file in the same directory.