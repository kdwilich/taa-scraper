const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');

// Function to introduce random delays
const randomDelay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

const scrapeInstagramPost = async (postLink) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
            // '--proxy-server=your-proxy-server:port' // Optional: Add proxy here
        ]
    });
    const page = await browser.newPage();

    const userAgent = randomUseragent.getRandom();
    await page.setUserAgent(userAgent);
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    console.log('Navigating to the post...');
    await page.goto(postLink, { waitUntil: 'networkidle2' });
    await page.waitForSelector('ul._a9ym', { timeout: 10000 });
    await page.evaluate(() => window.scrollBy(0, Math.random() * 500));
    await randomDelay(2000, 5000);

    const data = await page.evaluate(() => {
        const caption = document.querySelector('div._a9zr')?.innerText || '';
        let id;
        Array.from(document.querySelectorAll('ul._a9ym li')).forEach(el => {
            const username = el.querySelector('h3')?.innerText || '';
            const text = el.querySelector('div._a9zs')?.innerText || '';
            if (username === 'theanglersattic' && text.includes('#taa')) {
                const match = text.match(/#taa(\d+)/);
                id = match ? parseInt(match[1], 10) : null;
            }
        });
        return { caption, id };
    });

    console.log('Scraping completed. Closing browser...');
    await browser.close();
    return data;
};

module.exports = scrapeInstagramPost;
