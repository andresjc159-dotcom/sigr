import { useState, useEffect } from 'react';
import { productService, menuService } from '../../services/api';

const MasterProducts = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', categoria_id: '', stock: 20, destacado: false, ingredientes: []
  });
  const [nuevoIngrediente, setNuevoIngrediente] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prods, cats] = await Promise.all([
        productService.getProducts(),
        menuService.getCategories()
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const agregarIngrediente = () => {
    if (nuevoIngrediente.trim()) {
      setForm({ ...form, ingredientes: [...form.ingredientes, nuevoIngrediente.trim()] });
      setNuevoIngrediente('');
    }
  };

  const quitarIngrediente = (index) => {
    setForm({ ...form, ingredientes: form.ingredientes.filter((_, i) => i !== index) });
  };

  const guardar = async () => {
    setSaving(true);
    try {
      const data = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        categoria_id: form.categoria_id,
        stock: parseInt(form.stock) || 20,
        destacado: form.destacado,
        ingredientes: form.ingredientes
      };

      let productId = editingId;

      if (editingId) {
        await productService.updateProduct(editingId, data);
      } else {
        const created = await productService.createProduct(data);
        productId = created.id;
      }

      if (imageFile && productId) {
        await productService.uploadImage(productId, imageFile);
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ nombre: '', descripcion: '', precio: '', categoria_id: '', stock: 20, destacado: false, ingredientes: [] });
      setImageFile(null);
      setImagePreview(null);
      setNuevoIngrediente('');
      cargarDatos();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editar = (producto) => {
    setEditingId(producto.id);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      categoria_id: producto.categoria_id,
      stock: producto.stock || 20,
      destacado: producto.destacado || false,
      ingredientes: producto.ingredientes || []
    });
    setImageFile(null);
    setImagePreview(producto.imagen ? `http://localhost:3000${producto.imagen}` : null);
    setShowForm(true);
  };

  const eliminar = async (id, nombre) => {
    if (confirm(`¿Desactivar "${nombre}"? Esta acción ocultará el producto del menú.`)) {
      try {
        await productService.deleteProduct(id);
        cargarDatos();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const subirImagen = async (id, file) => {
    setUploadingId(id);
    try {
      await productService.uploadImage(id, file);
      cargarDatos();
    } catch (error) {
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>;

  return (
    <div style={{ padding: 40, color: '#1a1a1a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Productos</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nombre: '', descripcion: '', precio: '', categoria_id: '', stock: 20, destacado: false, ingredientes: [] }); setImageFile(null); setImagePreview(null); setNuevoIngrediente(''); }} style={{ padding: '12px 24px', background: '#e63946', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          {showForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24 }}>
          <h3>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
            <input placeholder="Precio" type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
          </div>
          <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} style={{ width: '100%', padding: 12, border: '2px solid #dee2e6', borderRadius: 8, marginTop: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <select value={form.categoria_id} onChange={e => setForm({...form, categoria_id: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }}>
              <option value="">Categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <input placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.destacado} onChange={e => setForm({...form, destacado: e.target.checked})} />
            Producto destacado
          </label>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Ingredientes</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                placeholder="Agregar ingrediente"
                value={nuevoIngrediente}
                onChange={e => setNuevoIngrediente(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarIngrediente(); }}}
                style={{ flex: 1, padding: 10, border: '2px solid #dee2e6', borderRadius: 8 }}
              />
              <button onClick={agregarIngrediente} style={{ padding: '10px 20px', background: '#2a9d8f', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Agregar</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {form.ingredientes.map((ing, index) => (
                <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #7dd3fc', borderRadius: 20, fontSize: 13 }}>
                  {ing}
                  <button onClick={() => quitarIngrediente(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
            {form.ingredientes.length === 0 && <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>No hay ingredientes agregados</p>}
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Imagen del producto</label>
            {imagePreview && (
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                <img src={imagePreview} alt="Preview" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, border: '2px solid #dee2e6' }} />
                <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#e63946', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
              </div>
            )}
            <div>
              <label style={{ display: 'inline-block', padding: '10px 20px', background: '#f0f9ff', color: '#0369a1', border: '2px dashed #7dd3fc', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
              </label>
            </div>
          </div>

          <button onClick={guardar} disabled={saving} style={{ marginTop: 16, padding: '12px 24px', background: '#e63946', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {productos.map(producto => (
          <div key={producto.id} style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            {producto.imagen ? (
              <img
                src={producto.imagen.startsWith('/') ? `http://localhost:3000${producto.imagen}` : producto.imagen}
                alt={producto.nombre}
                style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: '100%', height: 150, background: '#f8f9fa', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: 14 }}>Sin imagen</div>
            )}
            <h3 style={{ margin: '0 0 8px' }}>{producto.nombre}</h3>
            <p style={{ color: '#6c757d', fontSize: 14, margin: '0 0 12px' }}>{producto.descripcion}</p>

            {producto.ingredientes && producto.ingredientes.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#6c757d', fontWeight: 500 }}>Ingredientes:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {producto.ingredientes.slice(0, 4).map((ing, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '2px 8px', background: '#f3f4f6', color: '#4b5563', borderRadius: 12 }}>{ing}</span>
                  ))}
                  {producto.ingredientes.length > 4 && <span style={{ fontSize: 11, padding: '2px 8px', background: '#f3f4f6', color: '#4b5563', borderRadius: 12 }}>+{producto.ingredientes.length - 4}</span>}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 'bold', color: '#e63946' }}>${producto.precio}</span>
              <span style={{ fontSize: 12, color: '#6c757d' }}>{producto.categoria_nombre}</span>
            </div>
            {producto.destacado && <span style={{ display: 'inline-block', marginTop: 8, padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 4, fontSize: 12 }}>Destacado</span>}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => editar(producto)} style={{ flex: 1, padding: 8, background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                Editar
              </button>
              <button onClick={() => eliminar(producto.id, producto.nombre)} style={{ flex: 1, padding: 8, background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                Desactivar
              </button>
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'block', width: '100%', padding: 8, background: '#f0f9ff', color: '#0369a1', border: '1px dashed #7dd3fc', borderRadius: 6, cursor: 'pointer', textAlign: 'center', fontSize: 13 }}>
                {uploadingId === producto.id ? 'Subiendo...' : 'Cambiar imagen'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) subirImagen(producto.id, e.target.files[0]); }} disabled={uploadingId === producto.id} />
              </label>
            </div>
          </div>
        ))}
      </div>

      {productos.length === 0 && <p style={{ textAlign: 'center', color: '#6c757d' }}>No hay productos</p>}
    </div>
  );
};

export default MasterProducts;