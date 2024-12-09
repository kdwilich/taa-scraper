const puppeteer = require('puppeteer');
const scrapeInstagramPost = require('./scrapeInstagramPost');

(async () => {
  const postLink = 'https://www.instagram.com/p/DDVB-MNvd06/';
  const postData = await scrapeInstagramPost(puppeteer, postLink);

  console.log('post data:', postData);
})();