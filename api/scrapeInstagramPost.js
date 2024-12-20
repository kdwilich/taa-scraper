// local puppeteer:
// const puppeteer = require('puppeteer');
// vercal puppeteer:
const puppeteer = require('puppeteer-core');
const chromium = require("@sparticuz/chromium");
const randomUseragent = require('random-useragent');

const waitForSelectorWithRetry = async (page, selector, maxRetries = 3, delay) => {
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

const randomDelay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

const scrapeInstagramPost = async (postLink) => {
  const browser = await puppeteer.launch({
    // local opts:
    // headless: true,
    // args: [
    //   '--no-sandbox',
    //   '--disable-setuid-sandbox'
    // ]
    //vercel opts:
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  const userAgent = randomUseragent.getRandom();
  await page.setUserAgent(userAgent);
  await page.setViewport({ width: 1280, height: 800 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

  try {
    console.log('Navigating to the post...', postLink);
    await page.goto(postLink, { waitUntil: 'domcontentloaded' });
    // await page.waitForTimeout(3000);

    await waitForSelectorWithRetry(page, 'main', 5, 3000);
    
    await page.evaluate(async () => {
      for (let i = 0; i < 5; i++) {
        window.scrollBy(0, 500);
        await new Promise(r => setTimeout(r, 1000));
      }
    });
    await randomDelay(2000, 5000);
    
    page.on('console', (msg) => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`);
    });

    console.log('Scraping data from post...');
    let data = {};
    data = await page.evaluate((maxRetries = 3) => {
      const idRegex = /#taa(\d+)/;
      let caption = null;
      let id = null;
      for (let i = 0; i < maxRetries; i++) {
        function traverseTextNodes(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (!caption && text.includes('Vintage')) {
              caption = text;
              console.log('Found Caption: ', caption);
            }
            if (!id && idRegex.test(text)) {
              id = parseInt(text.match(idRegex)[1], 10);
              console.log('Found ID: ', id);
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (const child of node.childNodes) {
              traverseTextNodes(child);
              if (caption && id) return; // Stop early if both are found
            }
          }
        }

        traverseTextNodes(document.body);
        
        if (caption && id) {
          return { caption, id };
        }
        console.log(`Retrying to find data on page: (${i + 1}/${maxRetries})`);
      }

      if (caption) {
        console.log('Caption found. No ID found.');
        return { caption, id };
      } else if (id) {
        console.log('ID found. No Caption found.');
        return { caption, id };
      }

      throw new Error(`Failed to find Caption or ID: ${selector} after ${maxRetries} retries`);
    });

    console.log('Scraping completed.', data);
    return data;

  } catch (error) {
    console.error('Error scraping Instagram post:', error.message);
    throw error;
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
};

module.exports = scrapeInstagramPost;
