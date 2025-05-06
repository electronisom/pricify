<script>
  import { createEventDispatcher } from 'svelte';
  import { Trash2 } from 'lucide-svelte';

  export let products = [];
  const dispatch = createEventDispatcher();

  function handleRemove(productId) {
    dispatch('removeProduct', productId);
  }
</script>

<div class="table-container">
  <table>
    <thead>
      <tr>
        <th>Image</th>
        <th>Product</th>
        <th>Price</th>
        <th>Source</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each products as product (product.id)}
        <tr>
          <td>
            <img src={product.image} alt={product.name} class="product-image" />
          </td>
          <td>
            <div class="product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </div>
          </td>
          <td class="price">${product.price.toFixed(2)}</td>
          <td>
            <a href={product.url} target="_blank" rel="noopener noreferrer" class="source-link">
              {product.url.includes('amazon') ? 'Amazon' : 
               product.url.includes('aliexpress') ? 'AliExpress' : 
               product.url.includes('shein') ? 'Shein' : 'Unknown'}
            </a>
          </td>
          <td>
            <button on:click={() => handleRemove(product.id)} class="remove-button">
              <Trash2 size={20} />
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    margin-top: 2rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
  }

  .product-image {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: 8px;
  }

  .product-info {
    max-width: 400px;
  }

  .product-info h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    color: #333;
  }

  .product-info p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .price {
    font-weight: bold;
    color: #0077cc;
  }

  .source-link {
    color: #0077cc;
    text-decoration: none;
    font-weight: 500;
  }

  .source-link:hover {
    text-decoration: underline;
  }

  .remove-button {
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .remove-button:hover {
    background-color: #ffecec;
  }
</style>
