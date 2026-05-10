import { useState, useEffect } from 'react';
import { menuService, cartService } from '../../services/api';
import { IMG_BASE } from '../../config';

const ClientMenuPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const cats = await menuService.getCategories();
    const prods = await menuService.getProducts();
    setCategorias(cats);
    setProductos(prods);
  };

  const agregarAlCarrito = (producto) => {
    cartService.addItem(producto, 1);
    alert('Agregado al carrito');
  };

  const filtrarPorCategoria = async (categoriaId) => {
    setCategoriaSeleccionada(categoriaId);
    const prods = await menuService.getProducts(categoriaId);
    setProductos(prods);
  };

  return (
    <div className="container">
      <h1>Menú</h1>
      
      <input
        type="text"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="input"
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          className={`btn ${!categoriaSeleccionada ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => filtrarPorCategoria(null)}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            className={`btn ${categoriaSeleccionada === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => filtrarPorCategoria(cat.id)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {productos.map((prod) => (
          <div key={prod.id} className="card">
            {prod.imagen && (
              <img src={prod.imagen.startsWith('http') ? prod.imagen : `${IMG_BASE}${prod.imagen}`} alt={prod.nombre} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 4 }} />
            )}
            <h3>{prod.nombre}</h3>
            <p>{prod.descripcion}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>${prod.precio}</span>
              <button className="btn btn-primary" onClick={() => agregarAlCarrito(prod)}>
                Agregar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientMenuPage;