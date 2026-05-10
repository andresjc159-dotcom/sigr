-- ============================================================
-- SEMILLA DE DATOS - RED VELVET RESTAURANT
-- Ejecutar después del schema principal
-- ============================================================

-- 1. CREAR USUARIOS POR ROL
-- Master (password: master123)
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, estado)
VALUES (
    'Admin',
    'Master',
    'master@redvelvet.com',
    '555-0000',
    '$2b$10$YourValidBcryptHashHere', 
    'master',
    'activo'
) ON CONFLICT (email) DO NOTHING;

-- Administrador (password: admin123)
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, estado)
VALUES (
    'Laura',
    'Admin',
    'admin@redvelvet.com',
    '555-0001',
    '$2b$10$YourValidBcryptHashHere',
    'administrador',
    'activo'
) ON CONFLICT (email) DO NOTHING;

-- Meseros (password: mesero123)
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, estado)
VALUES 
    ('Carlos', 'Mesero', 'mesero1@redvelvet.com', '555-0002', '$2b$10$YourValidBcryptHashHere', 'mesero', 'activo'),
    ('Ana', 'Mesera', 'mesero2@redvelvet.com', '555-0003', '$2b$10$YourValidBcryptHashHere', 'mesero', 'activo')
ON CONFLICT (email) DO NOTHING;

-- Cliente (password: cliente123)
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, estado)
VALUES (
    'Juan',
    'Cliente',
    'cliente@redvelvet.com',
    '555-1234',
    '$2b$10$YourValidBcryptHashHere',
    'cliente',
    'activo'
) ON CONFLICT (email) DO NOTHING;

-- 2. CREAR CATEGORÍAS
INSERT INTO categorias (nombre, descripcion, orden) VALUES
    ('Entradas', 'Deliciosos platos para comenzar', 1),
    ('Platos Fuertes', 'Platos principales', 2),
    ('Bebidas', 'Refrescantes bebidas', 3),
    ('Postres', 'Dulces terminando', 4),
    ('Especiales', 'Ofertas especiales', 5)
ON CONFLICT (nombre) DO NOTHING;

-- 3. CREAR PRODUCTOS POR CATEGORÍA
-- Entradas
INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Bruschetta', 'Pan tostado con tomate y ajo', 85.00, 'activo', false, 20, 10
FROM categorias c WHERE c.nombre = 'Entradas';

INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Quesadillas', 'Quesadillas con tres quesos', 95.00, 'activo', false, 15, 15
FROM categorias c WHERE c.nombre = 'Entradas';

-- Platos Fuertes
INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Filete de Res', 'Carne de res al grill con verduras', 185.00, 'activo', true, 20, 25
FROM categorias c WHERE c.nombre = 'Platos Fuertes';

INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Pasta Carbonara', 'Pasta con salsa carbonara', 145.00, 'activo', false, 20, 20
FROM categorias c WHERE c.nombre = 'Platos Fuertes';

INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Pollo a la Plancha', 'Pechuga de pollo con especias', 135.00, 'activo', true, 25, 20
FROM categorias c WHERE c.nombre = 'Platos Fuertes';

-- Bebidas
INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Limonada Fresca', 'Limonada natural con menta', 45.00, 'activo', false, 50, 5
FROM categorias c WHERE c.nombre = 'Bebidas';

INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Agua Mineral', 'Agua sin gas 500ml', 25.00, 'activo', false, 50, 2
FROM categorias c WHERE c.nombre = 'Bebidas';

INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Refresco', 'Refresco de cola 355ml', 35.00, 'activo', false, 50, 2
FROM categorias c WHERE c.nombre = 'Bebidas';

-- Postres
INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Brownie de Chocolate', 'Brownie esponjoso con helado', 75.00, 'activo', true, 15, 15
FROM categorias c WHERE c.nombre = 'Postres';

INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Flan', 'Flan de vainilla con caramelo', 65.00, 'activo', false, 10, 10
FROM categorias c WHERE c.nombre = 'Postres';

INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Cheesecake', 'Cheesecake de fresa', 85.00, 'activo', true, 10, 12
FROM categorias c WHERE c.nombre = 'Postres';

-- Especiales
INSERT INTO productos (categoria_id, nombre, descripcion, precio, estado, destacado, stock, tiempo_prep_min)
SELECT c.id, 'Combo Deluxe', 'Incluye entrada, plato y postre', 299.00, 'activo', true, 10, 30
FROM categorias c WHERE c.nombre = 'Especiales';

-- 4. CREAR MESAS
INSERT INTO mesas (numero, capacidad, ubicacion, estado) VALUES
    (1, 2, 'Terraza', 'disponible'),
    (2, 4, 'Terraza', 'disponible'),
    (3, 4, 'Interior', 'disponible'),
    (4, 6, 'Interior', 'disponible'),
    (5, 8, 'Salón Privado', 'disponible'),
    (6, 2, 'Bar', 'disponible'),
    (7, 4, 'Bar', 'disponible'),
    (8, 10, 'Salón Privado', 'disponible');