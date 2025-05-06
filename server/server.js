import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
// import puppeteer from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
puppeteer.use(StealthPlugin());

async function fetchPage(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  const html = await page.content();
  await browser.close();
  return html;
}
function scrapeAmazon($) {
  // Try multiple selectors for title
  const title = $('#productTitle').text().trim() || 
                $('h1#title').text().trim() ||
                $('span#productTitle').text().trim();

  // Try multiple selectors for price
  let price = null;
  const priceSelectors = [
    '.a-price-whole',
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price .a-offscreen'
  ];

  for (const selector of priceSelectors) {
    const priceText = $(selector).first().text().trim();
    if (priceText) {
      price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      if (!isNaN(price)) break;
    }
  }

  // Try multiple selectors for image
  const image = $('#landingImage').attr('src') || 
                $('#imgBlkFront').attr('src') ||
                $('#main-image').attr('src') ||
                $('.image img').first().attr('src');

  // Try multiple selectors for description
  const description = $('#productDescription p').text().trim() || 
                     $('#feature-bullets li').first().text().trim() ||
                     $('#productOverview_feature_div').text().trim() ||
                     $('#detailBullets_feature_div').text().trim();

  // Validate required fields
  const missingFields = [];
  if (!title) missingFields.push('title');
  if (!price || isNaN(price)) missingFields.push('price');
  if (!image) missingFields.push('image');

  if (missingFields.length > 0) {
    throw new Error(`Could not extract: ${missingFields.join(', ')}. Please make sure this is a valid Amazon product page.`);
  }

  return {
    name: title,
    price: price,
    image: image,
    description: description || 'No description available',
    quantity: 1
  };
}

function scrapeAliExpress($) {
  // Try multiple selectors for title
  const title = $('h1.product-title-text').text().trim() ||
                $('.product-title').text().trim() ||
                $('h1.title').text().trim();

  // Try multiple selectors for price
  let price = null;
  const priceSelectors = [
    '.product-price-value',
    '.uniform-banner-box-price',
    '.product-price',
    '.price-current'
  ];

  for (const selector of priceSelectors) {
    const priceText = $(selector).first().text().trim();
    if (priceText) {
      price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      if (!isNaN(price)) break;
    }
  }

  // Try multiple selectors for image
  const image = $('.magnifier-image').attr('src') ||
                $('.product-image img').first().attr('src') ||
                $('.images-view-item img').first().attr('src') ||
                $('.detail-gallery-image img').first().attr('src');

  // Try multiple selectors for description
  const description = $('.product-description').text().trim() ||
                     $('.product-description-content').text().trim() ||
                     $('.product-description-detail').text().trim();

  // Validate required fields
  const missingFields = [];
  if (!title) missingFields.push('title');
  if (!price || isNaN(price)) missingFields.push('price');
  if (!image) missingFields.push('image');

  if (missingFields.length > 0) {
    throw new Error(`Could not extract: ${missingFields.join(', ')}. Please make sure this is a valid AliExpress product page.`);
  }

  return {
    name: title,
    price: price,
    image: image,
    description: description || 'No description available',
    quantity: 1
  };
}

function scrapeShein($) {
  // Try multiple selectors for title
  const title = $('.product-intro__head-name').text().trim() ||
                $('.product-intro__head-title').text().trim() ||
                $('.product-intro__head').text().trim();

  // Try multiple selectors for price
  let price = null;
  const priceSelectors = [
    '.product-intro__price-current',
    '.product-intro__price',
    '.product-intro__price-sale',
    '.product-intro__price-original'
  ];

  for (const selector of priceSelectors) {
    const priceText = $(selector).first().text().trim();
    if (priceText) {
      price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      if (!isNaN(price)) break;
    }
  }

  // Try multiple selectors for image
  const image = $('.product-intro__thumbs-item img').first().attr('src') ||
                $('.product-intro__thumbs-item img').first().attr('data-src') ||
                $('.product-intro__thumbs-item img').first().attr('data-lazy-src') ||
                $('.product-intro__thumbs-item img').first().attr('data-original');

  // Try multiple selectors for description
  const description = $('.product-intro__description').text().trim() ||
                     $('.product-intro__detail').text().trim() ||
                     $('.product-intro__detail-content').text().trim();

  // Validate required fields
  const missingFields = [];
  if (!title) missingFields.push('title');
  if (!price || isNaN(price)) missingFields.push('price');
  if (!image) missingFields.push('image');

  if (missingFields.length > 0) {
    throw new Error(`Could not extract: ${missingFields.join(', ')}. Please make sure this is a valid Shein product page.`);
  }

  return {
    name: title,
    price: price,
    image: image,
    description: description || 'No description available',
    quantity: 1
  };
}

app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    let product;
    if (url.includes('amazon.com') || url.includes('amazon.ae')) {
      product = scrapeAmazon($);
    } else if (url.includes('aliexpress.com')) {
      product = scrapeAliExpress($);
    } else if (url.includes('shein.com')) {
      product = scrapeShein($);
    } else {
      return res.status(400).json({ error: 'Unsupported website. Currently only Amazon, AliExpress, and Shein are supported.' });
    }

    res.json(product);
  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch product details' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 