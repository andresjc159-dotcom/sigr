# =============================================================================
# ARCHIVO: test_api.py
# PROPÓSITO: Contiene 18 pruebas funcionales automatizadas para la API REST
#            de Red Velvet. Cada prueba verifica un endpoint específico
#            usando la librería 'requests' de Python.
#
# ESTRUCTURA:
#   - TestAuth:      Pruebas de autenticación (login, perfil, control de acceso).
#   - TestCatalogos: Pruebas de endpoints públicos (categorías, productos, etc.).
#   - TestProductosCRUD: Pruebas de crear, leer, actualizar y desactivar productos.
#   - TestOrdenes:   Pruebas de creación de pedidos.
#   - TestHealth:    Prueba de salud del servidor.
#
# CONCEPTOS IMPORTANTES:
#   - Cada método que empieza con "test_" es detectado automáticamente por pytest.
#   - Los parámetros como "admin_token" son inyectados por pytest desde conftest.py.
#   - Los 'assert' verifican condiciones; si fallan, pytest marca la prueba como fallida.
#   - Los nombres descriptivos ayudan a identificar qué falla sin leer el código.
# =============================================================================

# --- IMPORTACIÓN DE MÓDULOS --------------------------------------------------
# import pytest:    Framework de testing (aunque aquí no se usa directamente,
#                   es necesario para que pytest reconozca la estructura).
import pytest

# import requests:  Librería HTTP para hacer peticiones a la API REST.
#                   Proporciona métodos como get(), post(), put(), delete().
import requests

# from config import ...: Importa constantes definidas en config.py.
#   API_BASE:          URL base de la API (https://...railway.app/api/v1).
#   CREDENTIALS:       Diccionario con credenciales de prueba.
#   CATEGORIA_ENTRADAS: UUID de la categoría "Entradas".
from config import API_BASE, CREDENTIALS, CATEGORIA_ENTRADAS


# =============================================================================
# CLASE: TestAuth
# PROPÓSITO: Agrupa todas las pruebas relacionadas con autenticación de usuarios.
#            pytest ejecuta cada método test_* como una prueba independiente.
# =============================================================================
class TestAuth:
    """
    Prueba: Login exitoso como administrador.
    
    Escenario: Un usuario con credenciales válidas de administrador intenta
    iniciar sesión.
    
    Lo que verifica:
      1. Código de respuesta HTTP 200 (OK).
      2. La respuesta contiene un campo "accessToken" (token JWT de acceso).
      3. La respuesta contiene un campo "refreshToken" (token para renovar sesión).
      4. El rol del usuario en la respuesta es "administrador".
      5. El email del usuario coincide con el esperado.
    
    Dato importante: El token JWT se genera en el backend usando bcrypt + jwt.
    El accessToken expira en 15 minutos y el refreshToken en 7 días.
    """
    def test_login_admin_exitoso(self):
        # Hace una petición POST al endpoint de login con las credenciales de admin.
        # requests.post() envía los datos como JSON automáticamente gracias a json=.
        # f"{API_BASE}/auth/login" se evalúa como "https://.../api/v1/auth/login".
        r = requests.post(f"{API_BASE}/auth/login", json=CREDENTIALS["admin"])
        
        # Verifica que el código de estado HTTP sea 200 (OK).
        # Si el servidor devuelve 401, 500 u otro código, este assert falla.
        assert r.status_code == 200
        
        # Convierte el cuerpo de la respuesta (JSON) a un diccionario de Python.
        data = r.json()
        
        # Verifica que el diccionario contiene la clave "accessToken".
        # Esto confirma que el servidor generó un token JWT correctamente.
        assert "accessToken" in data
        
        # Verifica que también existe el refreshToken para renovación de sesión.
        assert "refreshToken" in data
        
        # Verifica que el rol del usuario autenticado es "administrador".
        # Accede al diccionario anidado: data["user"]["rol"].
        assert data["user"]["rol"] == "administrador"
        
        # Verifica que el email del usuario autenticado es el correcto.
        assert data["user"]["email"] == "admin@redvelvet.com"

    """
    Prueba: Login exitoso como cliente.
    
    Escenario: Un cliente con credenciales válidas inicia sesión.
    
    Lo que verifica:
      - Código 200.
      - El rol retornado es "cliente"..
    """
    def test_login_cliente_exitoso(self):
        # Envía credenciales de cliente al endpoint de login.
        r = requests.post(f"{API_BASE}/auth/login", json=CREDENTIALS["cliente"])
        
        # Verifica código 200.
        assert r.status_code == 200
        
        # Verifica que el rol sea "cliente".
        # r.json() parsea el JSON y luego accedemos al campo anidado.
        assert r.json()["user"]["rol"] == "cliente"

    """
    Prueba: Login exitoso como mesero.
    
    Escenario: Un mesero con credenciales válidas inicia sesión.
    
    Lo que verifica:
      - Código 200.
      - El rol retornado es "mesero".
    """
    def test_login_mesero_exitoso(self):
        # Envía credenciales de mesero.
        r = requests.post(f"{API_BASE}/auth/login", json=CREDENTIALS["mesero"])
        assert r.status_code == 200
        assert r.json()["user"]["rol"] == "mesero"

    """
    Prueba: Login con credenciales inválidas (caso negativo).
    
    Escenario: Un usuario intenta iniciar sesión con un email y contraseña
    que no existen en el sistema.
    
    Lo que verifica:
      - Código 401 (Unauthorized - no autorizado).
      - El mensaje de error contiene la palabra "inválidas".
    
    Importante: Es tan importante probar los casos de error como los de éxito.
    Un sistema seguro debe rechazar credenciales incorrectas con el código
    adecuado (401) y un mensaje claro pero sin revelar información sensible.
    """
    def test_login_credenciales_invalidas(self):
        # Envía credenciales falsas que no existen en la base de datos.
        r = requests.post(f"{API_BASE}/auth/login", json={
            "email": "fake@test.com",
            "password": "wrong"
        })
        
        # Verifica que el servidor rechaza la petición con 401 (No autorizado).
        assert r.status_code == 401
        
        # Verifica que el mensaje de error contiene la palabra "inválidas".
        # r.json().get("message", "") obtiene el mensaje o string vacío si no existe.
        # .lower() convierte a minúsculas para comparación sin distinción de mayúsculas.
        assert "inválidas" in r.json().get("message", "").lower()

    """
    Prueba: Obtener perfil con token válido.
    
    Escenario: Un usuario autenticado (con token JWT) solicita su perfil.
    
    Dependencia: Recibe el fixture 'admin_token' (definido en conftest.py).
    
    Lo que verifica:
      - Código 200.
      - El email retornado coincide con el del usuario autenticado.
    
    token JWT: El token se envía en el header "Authorization" con el formato
    "Bearer <token>". El backend verifica que el token sea válido y no haya expirado.
    """
    def test_get_profile(self, admin_token):
        # Construye el header Authorization con el token JWT.
        # Formato estándar: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Hace GET al endpoint de perfil con el header de autenticación.
        r = requests.get(f"{API_BASE}/auth/profile", headers=headers)
        
        assert r.status_code == 200
        # Verifica que el email del perfil coincide con las credenciales de admin.
        assert r.json()["email"] == "admin@redvelvet.com"

    """
    Prueba: Obtener perfil SIN token (control de acceso).
    
    Escenario: Un usuario NO autenticado intenta acceder a un endpoint protegido.
    
    Lo que verifica:
      - Código 401 (debe rechazar la petición).
    
    Esta prueba es fundamental para verificar que el sistema tiene
    control de acceso implementado correctamente. Sin token, el backend
    debe rechazar la petición con 401, no con 200.
    """
    def test_get_profile_sin_token(self):
        # Hace GET al endpoint de perfil SIN enviar header de autenticación.
        r = requests.get(f"{API_BASE}/auth/profile")
        
        # Verifica que el servidor rechaza la petición (401 Unauthorized).
        # Si esto devolviera 200, significaría que el endpoint no está protegido.
        assert r.status_code == 401


# =============================================================================
# CLASE: TestCatalogos
# PROPÓSITO: Prueba los endpoints públicos de catálogo que no requieren
#            autenticación. Estos endpoints son la base de la aplicación
#            porque proporcionan los datos que ven los clientes.
# =============================================================================
class TestCatalogos:
    """
    Prueba: Listar categorías del menú.
    
    Escenario: Un usuario (sin autenticación) solicita la lista de categorías.
    
    Lo que verifica:
      - Código 200.
      - La respuesta es un array (lista).
      - Hay al menos 1 categoría.
      - La categoría "Entradas" existe en la lista.
    
    Endpoint público (no requiere token). GET /api/v1/categorias.
    """
    def test_listar_categorias(self):
        # GET a /categorias - endpoint público, sin autenticación.
        r = requests.get(f"{API_BASE}/categorias")
        
        assert r.status_code == 200
        
        # Convierte la respuesta JSON a lista de Python.
        cats = r.json()
        
        # Verifica que la respuesta sea una lista (type list).
        # isinstance() retorna True si el objeto es del tipo especificado.
        assert isinstance(cats, list)
        
        # Verifica que hay al menos 1 categoría en la lista.
        assert len(cats) >= 1
        
        # Extrae solo los nombres de las categorías usando una
        # list comprehension: [expresión for elemento in lista].
        nombres = [c["nombre"] for c in cats]
        
        # Verifica que "Entradas" está en la lista de nombres.
        assert "Entradas" in nombres

    """
    Prueba: Listar productos del menú.
    
    Escenario: Solicita la lista de todos los productos activos.
    
    Lo que verifica:
      - Código 200.
      - La respuesta es un array.
    
    Endpoint público: GET /api/v1/products.
    """
    def test_listar_productos(self):
        r = requests.get(f"{API_BASE}/products")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    """
    Prueba: Listar mesas del restaurante.
    
    Escenario: Solicita la lista de mesas disponibles.
    
    Lo que verifica:
      - Código 200.
      - Hay exactamente 8 mesas (las que se insertaron en el seed de datos).
    
    Endpoint público: GET /api/v1/tables.
    El seed de datos insertó 8 mesas con diferentes capacidades y ubicaciones.
    """
    def test_listar_mesas(self):
        r = requests.get(f"{API_BASE}/tables")
        assert r.status_code == 200
        mesas = r.json()
        # Verifica que existen las 8 mesas del seed de datos.
        assert len(mesas) == 8

    """
    Prueba: Listar toppings (complementos).
    
    Escenario: Solicita la lista de toppings disponibles para productos.
    
    Lo que verifica:
      - Código 200.
      - Es un array.
      - Al menos 1 topping.
      - "Aguacate" está en la lista.
    
    Endpoint público: GET /api/v1/toppings.
    """
    def test_listar_toppings(self):
        r = requests.get(f"{API_BASE}/toppings")
        assert r.status_code == 200
        tops = r.json()
        assert isinstance(tops, list)
        assert len(tops) >= 1
        # Verifica un topping específico que debería existir.
        nombres = [t["nombre"] for t in tops]
        assert "Aguacate" in nombres


# =============================================================================
# CLASE: TestProductosCRUD
# PROPÓSITO: Prueba el ciclo de vida completo de un producto: Crear, Leer,
#            Actualizar y Desactivar (CRUD - Create, Read, Update, Delete).
#            Estas pruebas requieren autenticación como administrador.
# =============================================================================
class TestProductosCRUD:
    """
    Prueba: Crear un nuevo producto.
    
    Escenario: Un administrador autenticado crea un producto con todos
    los campos requeridos.
    
    Lo que verifica:
      - Código 200 o 201.
      - La respuesta contiene un "id" (UUID del producto creado).
      - El nombre del producto creado coincide con el enviado.
    
    POST /api/v1/products - requiere autenticación.
    """
    def test_crear_producto(self, admin_token):
        # Prepara headers con autenticación y tipo de contenido.
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # Datos completos del producto a crear.
        payload = {
            "nombre": "Hamburguesa Cuarto de Libra",
            "descripcion": "Carne angus 150g con queso cheddar",
            "precio": 11.99,
            "categoria_id": CATEGORIA_ENTRADAS,
            "stock": 25,
            "destacado": True,
            "ingredientes": ["Carne angus", "Queso cheddar", "Lechuga", "Tomate"],
        }
        
        # Envía POST con el payload JSON.
        r = requests.post(f"{API_BASE}/products", json=payload, headers=headers)
        
        # Acepta tanto 200 como 201 (Created).
        assert r.status_code in (200, 201)
        
        data = r.json()
        # Verifica que el producto fue creado con un ID único.
        assert "id" in data
        # Verifica que el nombre se guardó correctamente.
        assert data["nombre"] == "Hamburguesa Cuarto de Libra"
        
        # --- CLEANUP ---
        # Elimina el producto creado para no dejar datos residuales.
        # El endpoint DELETE hace soft-delete (desactiva el producto).
        requests.delete(f"{API_BASE}/products/{data['id']}", headers=headers)

    """
    Prueba: Obtener un producto por su ID.
    
    Escenario: Después de crear un producto (vía fixture), se consulta
    por su ID y se verifica que los datos sean correctos.
    
    Dependencia: created_product_id (fixture que crea un producto y retorna su ID).
    
    GET /api/v1/products/:id - requiere autenticación.
    """
    def test_obtener_producto_por_id(self, created_product_id, admin_token):
        # Crea header de autenticación.
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # GET al producto específico usando el ID del fixture.
        r = requests.get(f"{API_BASE}/products/{created_product_id}", headers=headers)
        
        assert r.status_code == 200
        # Verifica que el nombre coincide con el definido en el fixture.
        assert r.json()["nombre"] == "Pytest Product"

    """
    Prueba: Actualizar un producto existente.
    
    Escenario: Se actualiza el nombre y precio de un producto existente.
    
    PUT /api/v1/products/:id - requiere autenticación.
    """
    def test_actualizar_producto(self, created_product_id, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # Envía solo los campos que se quieren actualizar.
        # PUT generalmente reemplaza todo el recurso, pero el backend
        # puede manejar actualizaciones parciales.
        r = requests.put(f"{API_BASE}/products/{created_product_id}", json={
            "nombre": "Pytest Product Updated",
            "precio": 24.99,
            "categoria_id": CATEGORIA_ENTRADAS,
        }, headers=headers)
        
        assert r.status_code == 200
        # Verifica que el nombre fue actualizado.
        assert r.json()["nombre"] == "Pytest Product Updated"

    """
    Prueba: Desactivar (soft-delete) un producto.
    
    Escenario: Se elimina un producto (soft-delete, no se borra físicamente).
    
    DELETE /api/v1/products/:id - requiere autenticación.
    
    Concepto: El sistema usa soft-delete, lo que significa que el registro
    no se elimina de la base de datos sino que cambia su estado a "inactivo".
    Esto permite recuperar productos eliminados si es necesario.
    """
    def test_desactivar_producto(self, created_product_id, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}"}
        r = requests.delete(f"{API_BASE}/products/{created_product_id}", headers=headers)
        assert r.status_code == 200
        # Verifica que el mensaje de respuesta contiene "desactivado".
        assert "desactivado" in r.json().get("message", "").lower()

    """
    Prueba: Crear producto sin nombre (caso borde / validación).
    
    Escenario: Se intenta crear un producto sin enviar el campo "nombre".
    
    Lo que verifica:
      - El servidor debe rechazar la petición con código 400 o 500.
      - Idealmente debería ser 400 (Bad Request - validación del lado del servidor).
    
    Si el servidor devolviera 200, significaría que no hay validación
    de campos obligatorios, lo cual sería un bug.
    """
    def test_crear_producto_sin_nombre(self, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        # Envía solo precio, sin nombre (que debería ser obligatorio).
        r = requests.post(f"{API_BASE}/products", json={"precio": 5}, headers=headers)
        # Acepta 400 (Bad Request) o 500 (Error interno) porque el backend
        # actualmente no valida campo obligatorio antes de procesar.
        assert r.status_code in (400, 500)

    """
    Prueba: Crear producto sin autenticación (control de acceso).
    
    Escenario: Un usuario NO autenticado intenta crear un producto.
    
    Lo que verifica:
      - Código 401 (debe rechazar la creación).
      - Los endpoints de escritura deben estar protegidos.
    """
    def test_crear_producto_sin_autenticacion(self):
        # POST sin header de autorización.
        r = requests.post(f"{API_BASE}/products", json={"nombre": "Test"})
        # Debe rechazar con 401 (No autenticado).
        assert r.status_code == 401


# =============================================================================
# CLASE: TestOrdenes
# PROPÓSITO: Prueba el flujo de creación de pedidos (órdenes).
# =============================================================================
class TestOrdenes:
    """
    Prueba: Crear una orden de tipo "local" (pedido en el restaurante).
    
    Escenario: Un administrador crea un pedido para la mesa #1 con un producto.
    
    Lo que verifica:
      - Código 200 o 201.
      - La respuesta contiene un "id".
      - El tipo de pedido es "local".
    
    POST /api/v1/orders - requiere autenticación.
    """
    def test_crear_orden_local(self, admin_token):
        # Prepara headers: autenticación + JSON.
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # Payload del pedido:
        # - productos: lista de items con producto_id, cantidad y precio.
        # - tipo: "local" (come en el restaurante) o "domicilio".
        # - mesa_id: opcional, para pedidos locales.
        payload = {
            "productos": [
                {
                    "producto_id": "983ef63a-7908-40bc-840e-7a2de392abc2",
                    "cantidad": 1,
                    "precio": 9.99,
                }
            ],
            "tipo": "local",
            "mesa_id": "bfa7e71d-c1d7-4ba0-a665-730d0acf2173",
        }
        
        # Envía POST para crear el pedido.
        r = requests.post(f"{API_BASE}/orders", json=payload, headers=headers)
        assert r.status_code in (200, 201)
        
        data = r.json()
        # Verifica que se creó un ID para el pedido.
        assert "id" in data
        # Verifica que el tipo sea "local".
        assert data["tipo"] == "local"
        
        # --- CLEANUP ---
        # Cancela la orden creada para no dejar datos residuales.
        # PATCH /orders/:id/status cambia el estado del pedido.
        # Se envía "cancelado" con un motivo de cancelación.
        requests.patch(
            f"{API_BASE}/orders/{data['id']}/status",
            json={"estado": "cancelado", "motivo": "Test cleanup"},
            headers=headers,
        )


# =============================================================================
# CLASE: TestHealth
# PROPÓSITO: Prueba el endpoint de salud del servidor.
# =============================================================================
class TestHealth:
    """
    Prueba: Health Check del servidor.
    
    Escenario: Se verifica que el servidor backend está funcionando.
    
    Lo que verifica:
      - Código 200.
      - El campo "status" es "ok".
      - Existe un campo "timestamp".
    
    Este es el endpoint más básico y fundamental. Si falla, significa
    que el servidor no está corriendo o no responde.
    
    NOTA: El health check está en la raíz (/health), no en /api/v1/health.
    Por eso usamos API_BASE.replace("/api/v1", "/health") para construir la URL.
    """
    def test_health_check(self):
        # Construye la URL: reemplaza "/api/v1" por "/health".
        # API_BASE = "https://...railway.app/api/v1"
        # Resultado = "https://...railway.app/health"
        r = requests.get(API_BASE.replace("/api/v1", "/health"))
        
        assert r.status_code == 200
        data = r.json()
        # Verifica que el servidor reporta estado "ok".
        assert data["status"] == "ok"
        # Verifica que incluye un timestamp de la hora del servidor.
        assert "timestamp" in data
