const express = require('express');
const axios = require('axios');
const app = express();
const scrapeInstagramPost = require('./scrapeInstagramPost');
const sendEmail = require('./sendEmail');
const cleanInstagramURL = require('./tools');

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/getPostDetails', async (req, res) => {
  const postLink = req.query.link;

  if (!postLink) {
    return res.status(400).json({ error: 'Instagram post link is required' });
  }

  try {
    const data = await scrapeInstagramPost(postLink);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error scraping Instagram post:', error.message);
    res.status(500).json({ error: 'Failed to scrape the post' });
  }
});

app.post('/api/processSoldItem', async (req, res) => {
  const fields = req.body;

  if (!fields.link || !fields.soldTo || !fields.address || !fields.soldPrice) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  fields.link = cleanInstagramURL(fields.link);

  try {
    console.log('Processing link...', fields.link);
    const { data: postDetails } = await axios.get(`https://theanglersattic.vercel.app/api/getPostDetails?link=${encodeURIComponent(fields.link)}`)
    Object.assign(fields, postDetails);

    const dateSold = new Date();
    Object.assign(fields, { dateSold });

    const subject = `You sold an item on Instagram`
    const body = Object.entries(fields).map(([key, value]) => `<div style="color:black">${key}: ${value}</div>`).join('');

    console.log('Data being sent: ', JSON.stringify(fields));

    console.log('Sending Email...');
    await sendEmail(subject, body);
    console.log('Email Sent...');

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;