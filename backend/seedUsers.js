import { query } from './src/config/database.js';

const users = [
  { nombre: 'Admin', apellido: 'Master', email: 'master@redvelvet.com', telefono: '555-0000', rol: 'master', password: 'master123' },
  { nombre: 'Laura', apellido: 'Admin', email: 'admin@redvelvet.com', telefono: '555-0001', rol: 'administrador', password: 'admin123' },
  { nombre: 'Carlos', apellido: 'Mesero', email: 'mesero1@redvelvet.com', telefono: '555-0002', rol: 'mesero', password: 'mesero123' },
  { nombre: 'Ana', apellido: 'Mesera', email: 'mesero2@redvelvet.com', telefono: '555-0003', rol: 'mesero', password: 'mesero123' },
  { nombre: 'Juan', apellido: 'Cliente', email: 'cliente@redvelvet.com', telefono: '555-1234', rol: 'cliente', password: 'cliente123' }
];

async function seed() {
  console.log('Creando usuarios...');
  
  for (const user of users) {
    try {
      const passwordHash = '$2b$10$abcdefghijklmnopqrstuvwxyz'; 
      
      await query(
        `INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, estado)
         VALUES ($1, $2, $3, $4, $5, $6, 'activo')
         ON CONFLICT (email) DO NOTHING`,
        [user.nombre, user.apellido, user.email, user.telefono, passwordHash, user.rol]
      );
      console.log(`✓ ${user.rol}: ${user.email} / ${user.password}`);
    } catch (err) {
      console.error(`Error ${user.email}:`, err.message);
    }
  }
  
  console.log('\nCategorías...');
  const categorias = [
    { nombre: 'Entradas', descripcion: 'Deliciosos platos para comenzar', orden: 1 },
    { nombre: 'Platos Fuertes', descripcion: 'Platos principales', orden: 2 },
    { nombre: 'Bebidas', descripcion: 'Refrescantes bebidas', orden: 3 },
    {nombre: 'Postres', descripcion: 'Dulces terminate', orden: 4 },
    {nombre: 'Especiales', descripcion: 'Ofertas especiales', orden: 5 }
  ];
  
  for (const cat of categorias) {
    await query(
      `INSERT INTO categorias (nombre, descripcion, orden) VALUES ($1, $2, $3) ON CONFLICT (nombre) DO NOTHING`,
      [cat.nombre, cat.descripcion, cat.orden]
    );
    console.log(`✓ ${cat.nombre}`);
  }
  
  console.log('\nProductos...');
  const productos = [
    { nombre: 'Bruschetta', descripcion: 'Pan tostado con tomate y ajo', precio: 85, cat: 'Entradas' },
    { nombre: 'Quesadillas', descripcion: 'Con tres quesos', precio: 95, cat: 'Entradas' },
    { nombre: 'Filete de Res', descripcion: 'Carne de res al grill', precio: 185, cat: 'Platos Fuertes' },
    { nombre: 'Pasta Carbonara', descripcion: 'Pasta italiana clásica', precio: 145, cat: 'Platos Fuertes' },
    { nombre: 'Pollo a la Plancha', descripcion: 'Pechuga con especias', precio: 135, cat: 'Platos Fuertes' },
    { nombre: 'Limonada Fresca', descripcion: 'Con menta', precio: 45, cat: 'Bebidas' },
    { nombre: 'Agua Mineral', descripcion: '500ml', precio: 25, cat: 'Bebidas' },
    { nombre: 'Refresco', descripcion: 'Cola 355ml', precio: 35, cat: 'Bebidas' },
    {nombre: 'Brownie', descripcion: 'Con helado', precio: 75, cat: 'Postres' },
    {nombre: 'Flan', descripcion: 'Con caramelo', precio: 65, cat: 'Postres' },
    {nombre: 'Cheesecake', descripcion: 'De fresa', precio: 85, cat: 'Postres' },
    {nombre: 'Combo Deluxe', descripcion: 'Entrada + plato + postre', precio: 299, cat: 'Especiales' }
  ];
  
  for (const prod of productos) {
    const catResult = await query('SELECT id FROM categorias WHERE nombre = $1', [prod.cat]);
    if (catResult.rows[0]) {
      await query(
        `INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
         VALUES ($1, $2, $3, $4, 'activo', false, 20, 15) ON CONFLICT DO NOTHING`,
        [catResult.rows[0].id, prod.nombre, prod.descripcion, prod.precio]
      );
      console.log(`✓ ${prod.nombre}`);
    }
  }
  
  console.log('\nMesas...');
  const mesas = [
    { numero: 1, capacidad: 2, ubicacion: 'Terraza' },
    { numero: 2, capacidad: 4, ubicacion: 'Terraza' },
    { numero: 3, capacidad: 4, ubicacion: 'Interior' },
    { numero: 4, capacidad: 6, ubicacion: 'Interior' },
    { numero: 5, capacidad: 8, ubicacion: 'Salón Privado' },
    { numero: 6, capacidad: 2, ubicacion: 'Bar' },
    { numero: 7, capacidad: 4, ubicacion: 'Bar' },
    { numero: 8, capacidad: 10, ubicacion: 'Salón Privado' }
  ];
  
  for (const mesa of mesas) {
    await query(
      `INSERT INTO mesas (numero, capacidad, ubicacion, estado) VALUES ($1, $2, $3, 'disponible') ON CONFLICT (numero) DO NOTHING`,
      [mesa.numero, mesa.capacidad, mesa.ubicacion]
    );
    console.log(`✓ Mesa ${mesa.numero}`);
  }
  
  console.log('\n✓ Base de datos poblada correctamente!');
}

seed();