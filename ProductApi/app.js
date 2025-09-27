// Ajusta la URL según el puerto de tu API
const API_URL = "https://localhost:7083/api/products"; // <-- cambia si es necesario

const form = document.getElementById('product-form');
const tbody = document.querySelector('#products-table tbody');
const cancelBtn = document.getElementById('cancel-btn');

async function fetchProducts(){
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    renderProducts(data);
  } catch(err) {
    console.error('Error al obtener productos', err);
  }
}

function renderProducts(products){
  tbody.innerHTML = '';
  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.description}</td>
      <td>${p.price}</td>
      <td>${p.stock}</td>
      <td>
        <button data-id="${p.id}" class="edit-btn">Editar</button>
        <button data-id="${p.id}" class="delete-btn">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// manejar clicks en la tabla (delegation)
tbody.addEventListener('click', async (e) => {
  if(e.target.classList.contains('edit-btn')){
    const id = e.target.dataset.id;
    await loadProductToForm(id);
  }
  if(e.target.classList.contains('delete-btn')){
    const id = e.target.dataset.id;
    if(confirm('¿Eliminar producto?')){
      await deleteProduct(id);
      await fetchProducts();
    }
  }
});

async function loadProductToForm(id){
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if(!res.ok) throw new Error('No encontrado');
    const p = await res.json();
    document.getElementById('product-id').value = p.id;
    document.getElementById('name').value = p.name;
    document.getElementById('description').value = p.description || '';
    document.getElementById('price').value = p.price;
    document.getElementById('stock').value = p.stock;
  } catch(err) {
    console.error(err);
    alert('Error cargando producto');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const product = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    price: parseFloat(document.getElementById('price').value),
    stock: parseInt(document.getElementById('stock').value, 10)
  };

  try {
    if(id){
      // update
      const res = await fetch(`${API_URL}/${id}`,{
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...product, id: parseInt(id,10)})
      });


      if(!res.ok) throw new Error('Error al actualizar');
    } else {
      // create
      const res = await fetch(API_URL,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });


      if(!res.ok) throw new Error('Error al crear');
    }
    resetForm();
    await fetchProducts();
  } catch(err) {
    console.error(err);
    alert('Error en la operación');
  }
});

cancelBtn.addEventListener('click', (e) => {
  e.preventDefault();
  resetForm();
});

function resetForm(){
  document.getElementById('product-id').value = '';
  form.reset();
}

async function deleteProduct(id){
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if(!res.ok) throw new Error('No se pudo eliminar');
  } catch(err) {
    console.error(err);
    alert('Error al eliminar');
  }
}

// Inicializar
fetchProducts();