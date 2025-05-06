<script>
  import ProductForm from './components/ProductForm.svelte';
  import ProductTable from './components/ProductTable.svelte';
//   import EmailForm from './components/EmailForm.svelte';
  import { onMount } from 'svelte';

  let products = [];
  let showEmailForm = false;

  function handleAddProduct(event) {
    const newProduct = event.detail;
    products = [...products, newProduct];
    console.log('Product added:', newProduct);
  }

  function handleRemoveProduct(productId) {
    products = products.filter(p => p.id !== productId);
  }

  function handleSendEmail() {
    showEmailForm = true;
  }

  function handleEmailSent() {
    showEmailForm = false;
    products = [];
  }

  onMount(() => {
    // Load saved products from localStorage if any
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      products = JSON.parse(savedProducts);
    }
  });

  // Save products to localStorage whenever they change
  $: if (products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
</script>

<main>
  <div class="container">
    <h1>Pricify</h1>
    <p class="subtitle">Compare prices from Amazon, AliExpress, and Shein</p>

    <ProductForm on:addProduct={handleAddProduct} />

    {#if products.length > 0}
      <ProductTable {products} on:removeProduct={handleRemoveProduct} />
      <div class="actions">
        <button on:click={handleSendEmail} class="send-button">
          Send Quote Request
        </button>
      </div>
    {/if}

    <!-- {#if showEmailForm}
      <EmailForm {products} on:emailSent={handleEmailSent} />
    {/if} -->
  </div>
</main>

<style>
  main {
    padding: 2rem;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    font-size: 2.5rem;
    color: #0077cc;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
  }

  .actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  .send-button {
    background-color: #0077cc;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .send-button:hover {
    background-color: #005fa3;
  }
</style>
  
