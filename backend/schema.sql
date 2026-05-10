CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE rol_usuario AS ENUM ('master', 'administrador', 'mesero', 'cliente');
CREATE TYPE estado_usuario AS ENUM ('activo', 'inactivo');

CREATE TABLE usuarios (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    telefono         VARCHAR(20),
    password_hash    TEXT NOT NULL,
    rol              rol_usuario NOT NULL DEFAULT 'cliente',
    estado           estado_usuario NOT NULL DEFAULT 'activo',
    foto_perfil      TEXT,
    refresh_token    TEXT,
    ultimo_acceso    TIMESTAMPTZ,
    creado_por       UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE configuracion_visual (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logo_principal      TEXT,
    logo_blanco         TEXT,
    favicon             TEXT,
    color_primario      VARCHAR(7) NOT NULL DEFAULT '#C0392B',
    color_secundario    VARCHAR(7) NOT NULL DEFAULT '#2C2C2A',
    color_acento        VARCHAR(7) NOT NULL DEFAULT '#E74C3C',
    modo_tema           VARCHAR(10) NOT NULL DEFAULT 'claro',
    nombre_restaurante VARCHAR(100) NOT NULL DEFAULT 'Red Velvet',
    slogan              VARCHAR(200),
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    actualizado_por     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO configuracion_visual (color_primario, color_secundario, color_acento, modo_tema, nombre_restaurante)
VALUES ('#C0392B', '#2C2C2A', '#E74C3C', 'claro', 'Red Velvet');

CREATE TABLE categorias (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(80) NOT NULL UNIQUE,
    descripcion     TEXT,
    imagen          TEXT,
    orden           SMALLINT NOT NULL DEFAULT 0,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE estado_producto AS ENUM ('activo', 'inactivo', 'agotado');

CREATE TABLE productos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id    UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre          VARCHAR(120) NOT NULL,
    descripcion     TEXT,
    precio          NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    imagen          TEXT,
    estado          estado_producto NOT NULL DEFAULT 'activo',
    destacado       BOOLEAN NOT NULL DEFAULT FALSE,
    stock           INTEGER CHECK (stock >= 0),
    calorias        INTEGER,
    tiempo_prep_min SMALLINT,
    creado_por      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE estado_mesa AS ENUM ('disponible', 'ocupada', 'reservada', 'fuera_de_servicio');

CREATE TABLE mesas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero          SMALLINT NOT NULL UNIQUE,
    capacidad       SMALLINT NOT NULL CHECK (capacidad > 0),
    ubicacion       VARCHAR(60),
    estado          estado_mesa NOT NULL DEFAULT 'disponible',
    mesero_id       UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE tipo_pedido   AS ENUM ('local', 'domicilio');
CREATE TYPE estado_pedido AS ENUM ('pendiente', 'en_cocina', 'listo', 'entregado', 'cancelado');
CREATE TYPE metodo_pago   AS ENUM ('efectivo', 'tarjeta', 'transferencia');
CREATE TYPE estado_pago   AS ENUM ('pendiente', 'pagado', 'reembolsado');

CREATE TABLE pedidos (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido       SERIAL UNIQUE,
    cliente_id          UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    mesero_id           UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    mesa_id             UUID REFERENCES mesas(id) ON DELETE SET NULL,
    tipo                tipo_pedido NOT NULL DEFAULT 'local',
    estado              estado_pedido NOT NULL DEFAULT 'pendiente',
    direccion_entrega   TEXT,
    ciudad              VARCHAR(80),
    referencia          TEXT,
    subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    descuento           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
    impuesto            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (impuesto >= 0),
    total               NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    metodo_pago         metodo_pago,
    estado_pago         estado_pago NOT NULL DEFAULT 'pendiente',
    notas               TEXT,
    motivo_cancelacion  TEXT,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE detalles_pedido (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id       UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id     UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad        SMALLINT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal        NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    observaciones   TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio');

CREATE TABLE reservas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    mesa_id         UUID REFERENCES mesas(id) ON DELETE SET NULL,
    nombre_contacto VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20) NOT NULL,
    email_contacto  VARCHAR(150),
    fecha_reserva   DATE NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME,
    num_personas    SMALLINT NOT NULL CHECK (num_personas > 0),
    estado          estado_reserva NOT NULL DEFAULT 'pendiente',
    nota_especial   TEXT,
    nota_interna    TEXT,
    gestionado_por  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_ts BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trg_config_visual_ts BEFORE UPDATE ON configuracion_visual FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trg_categorias_ts BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trg_productos_ts BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trg_mesas_ts BEFORE UPDATE ON mesas FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trg_pedidos_ts BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trg_reservas_ts BEFORE UPDATE ON reservas FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();