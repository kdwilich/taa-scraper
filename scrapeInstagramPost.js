const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');

const isVercel = process.env.VERCEL === '1'; // This checks if the app is running on Vercel

// Function to introduce random delays
const randomDelay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

const waitForSelectorWithRetry = async (page, selector, maxRetries = 3, delay = 3000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, { timeout: delay });
      return true;
    } catch (err) {
      console.log(`Retrying to load selector: ${selector} (${i + 1}/${maxRetries})`);
    }
  }
  throw new Error(`Failed to load selector: ${selector} after ${maxRetries} retries`);
};

const scrapeInstagramPost = async (postLink) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      ...(isVercel ? [
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ] : [])
      // '--proxy-server=your-proxy-server:port' // Optional: Add proxy here
    ]
  });
  const page = await browser.newPage();

  const userAgent = randomUseragent.getRandom();
  await page.setUserAgent(userAgent);
  await page.setViewport({ width: 1280, height: 800 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

  console.log('Navigating to the post...');
  await page.goto(postLink, { waitUntil: 'domcontentloaded' });
  await waitForSelectorWithRetry(page, 'ul._a9ym', 5, 5000);
  await page.evaluate(() => window.scrollBy(0, Math.random() * 500));
  await randomDelay(2000, 5000);
  
  let data = {};
  try {
    data = await page.evaluate(() => {
      const caption = document.querySelector('div._a9zr ._a9zs')?.innerText || '';
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
  } catch (error) {
    console.error('Error during evaluation:', error.message);
  }
  console.log('Scraping completed. Closing browser...');
  await browser.close();
  return data;
};

module.exports = scrapeInstagramPost;
