const axios = require('axios');
const scrapeInstagramPost = require('./scrapeInstagramPost');
const sendEmail = require('./sendEmail');

// (async () => {
//   const postLink = 'https://www.instagram.com/p/DDVB-MNvd06/';
//   const postData = await scrapeInstagramPost(postLink);

//   console.log('post data:', postData);
// })();


(async () => {
  const fields = {
    link: 'https://www.instagram.com/p/DDXl43Rvt62/',
    soldTo: 'angler',
    address: '123 easy st',
    soldPrice: 47
  }
  const { data: postDetails } = process.env.FLAG_USEFAKEDATA
    ? { data: { caption: 'Vintage Eddie Bauer Denim Embroidered Dry Fly Shirt. Size XXL (26x32). $67 shipped.', id: 70 } }
    : await axios.get(`https://theanglersattic.vercel.app/api/getPostDetails?link=${encodeURIComponent(fields.link)}`)
  Object.assign(fields, postDetails);

  const dateSold = new Date();
  Object.assign(fields, { dateSold });

  const subject = `You sold an item on Instagram to ${fields.soldTo}`
  const body = Object.entries(fields).map(([key, value]) => `<div style="color:black">${key}: ${value}</div>`).join('');
  
  await sendEmail(subject, body);
  
  console.log(subject);
  console.log(body);
})();