const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const API_URL = 'http://localhost:3000/api';

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch product details');
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error fetching page:', error);
    throw new Error('Failed to fetch product details');
  }
}

export async function scrapeProduct(url) {
  try {
    const response = await fetch(`${API_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch product details');
    }

    return await response.json();
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(error.message || 'Failed to fetch product details. Please try again.');
  }
}

function scrapeAmazon(doc) {
  const title = doc.querySelector('#productTitle')?.textContent?.trim();
  const priceElement = doc.querySelector('.a-price-whole');
  const price = priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) : null;
  const image = doc.querySelector('#landingImage')?.src || doc.querySelector('#imgBlkFront')?.src;
  const description = doc.querySelector('#productDescription p')?.textContent?.trim() || 
                     doc.querySelector('#feature-bullets li')?.textContent?.trim();

  if (!title || !price || !image) {
    throw new Error('Could not extract all required product information');
  }

  return {
    name: title,
    price: price,
    image: image,
    description: description || 'No description available',
    quantity: 1
  };
}

function scrapeAliExpress(doc) {
  const title = doc.querySelector('h1.product-title-text')?.textContent?.trim();
  const priceElement = doc.querySelector('.product-price-value');
  const price = priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) : null;
  const image = doc.querySelector('.magnifier-image')?.src || 
                doc.querySelector('.product-image img')?.src;
  const description = doc.querySelector('.product-description')?.textContent?.trim();

  if (!title || !price || !image) {
    throw new Error('Could not extract all required product information');
  }

  return {
    name: title,
    price: price,
    image: image,
    description: description || 'No description available',
    quantity: 1
  };
} 