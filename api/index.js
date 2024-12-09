const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();
const scrapeInstagramPost = require('./scrapeInstagramPost');

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/getPostDetails', async (req, res) => {
  const postLink = req.query.link;

  if (!postLink) {
    return res.status(400).json({ error: 'Instagram post link is required' });
  }

  try {
    const data = await scrapeInstagramPost(puppeteer, postLink);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error scraping Instagram post:', error.message);
    res.status(500).json({ error: 'Failed to scrape the post' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;