const scrapeInstagramPost = require('./scrapeInstagramPost'); // Your function's file

(async () => {
  const postLink = 'https://www.instagram.com/theanglersattic/p/DDSa_j1Pk2A/';
  const postData = await scrapeInstagramPost(postLink);

  console.log('post data:', postData);
})();