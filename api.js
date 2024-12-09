const express = require('express');
const app = express();
const scrapeInstagramPost = require('./scrapeInstagramPost'); // Your function's file

// Middleware to parse JSON requests
app.use(express.json());

app.post('/api/getPostDetails', async (req, res) => {
    const { postLink } = req.body;

    if (!postLink) {
        return res.status(400).json({ error: 'Post link is required' });
    }

    try {
        const data = await scrapeInstagramPost(postLink);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error scraping Instagram post:', error.message);
        res.status(500).json({ error: 'Failed to scrape the post' });
    }
});

// Export for Vercel
module.exports = app;