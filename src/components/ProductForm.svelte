<script>
  import { createEventDispatcher } from 'svelte';
  import { scrapeProduct } from '../services/productScraper';
  import { Loader2, AlertCircle } from 'lucide-svelte';
  
  const dispatch = createEventDispatcher();
  
  let productUrl = '';
  let loading = false;
  let error = '';
  let previewProduct = null;

  async function handleSubmit() {
    if (!productUrl) {
      error = 'Please enter a product URL';
      return;
    }

    // Validate URL format
    try {
      new URL(productUrl);
    } catch (e) {
      error = 'Please enter a valid URL';
      return;
    }

    // Check if URL is from supported sites
    if (!productUrl.includes('amazon.com') && 
        !productUrl.includes('amazon.ae') && 
        !productUrl.includes('aliexpress.com') && 
        !productUrl.includes('shein.com')) {
      error = 'Please enter a URL from Amazon, AliExpress, or Shein';
      return;
    }

    loading = true;
    error = '';
    previewProduct = null;

    try {
      const product = await scrapeProduct(productUrl);
      
      if (!product || !product.name || !product.price) {
        throw new Error('Could not extract product information. Please try again.');
      }

      previewProduct = product;
      console.log('Product preview loaded:', product);
    } catch (err) {
      console.error('Error fetching product:', err);
      error = err.message || 'Failed to fetch product details. Please try again.';
      previewProduct = null;
    } finally {
      loading = false;
    }
  }

  function addToTable() {
    if (previewProduct) {
      const productToAdd = {
        ...previewProduct,
        url: productUrl,
        id: Date.now()
      };
      dispatch('addProduct', productToAdd);
      productUrl = '';
      previewProduct = null;
      error = '';
    }
  }
</script>

<div class="form-container">
  <form on:submit|preventDefault={handleSubmit} class="product-form">
    <label for="productUrl">Product URL</label>
    <div class="input-group">
      <input
        type="url"
        id="productUrl"
        bind:value={productUrl}
        placeholder="Paste Amazon, AliExpress, or Shein product URL here"
        required
      />
      <button type="submit" disabled={loading}>
        {#if loading}
          <Loader2 class="spinner" size={20} />
          <span>Loading...</span>
        {:else}
          <span>Preview</span>
        {/if}
      </button>
    </div>

    {#if error}
      <div class="error-message">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    {/if}
  </form>

  {#if previewProduct}
    <div class="product-preview">
      <img src={previewProduct.image} alt={previewProduct.name} />
      <div class="details">
        <h3>{previewProduct.name}</h3>
        <p>{previewProduct.description}</p>
        <div class="price-action">
          <span class="price">${previewProduct.price.toFixed(2)}</span>
          <button on:click={addToTable} class="add-button">Add to Table</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .form-container {
    background-color: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.06);
  }

  .product-form label {
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
  }

  .input-group {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .input-group input {
    flex: 1;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  .input-group input:focus {
    border-color: #0077cc;
    outline: none;
  }

  .input-group button {
    padding: 10px 16px;
    background-color: #0077cc;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 100px;
    justify-content: center;
  }

  .input-group button:hover {
    background-color: #005fa3;
  }

  .input-group button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #d8000c;
    background-color: #ffecec;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    margin-bottom: 16px;
  }

  .product-preview {
    display: flex;
    gap: 16px;
    background-color: #f9f9f9;
    padding: 16px;
    border-radius: 10px;
    border: 1px solid #ddd;
  }

  .product-preview img {
    width: 120px;
    height: 120px;
    object-fit: contain;
    border-radius: 8px;
  }

  .details {
    flex: 1;
  }

  .details h3 {
    margin: 0 0 8px;
    font-size: 1.2rem;
    color: #333;
  }

  .details p {
    margin: 0 0 12px;
    font-size: 0.95rem;
    color: #555;
    line-height: 1.4;
  }

  .price-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #0077cc;
  }

  .add-button {
    background-color: #28a745;
    color: white;
    padding: 8px 16px;
    border: none;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .add-button:hover {
    background-color: #218838;
  }
</style>
