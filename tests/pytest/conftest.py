# =============================================================================
# ARCHIVO: conftest.py
# PROPÓSITO: Define los fixtures (recursos compartidos) que pytest inyecta
#            automáticamente en las funciones de prueba. Los fixtures
#            permiten reutilizar objetos como tokens de autenticación,
#            productos de prueba, etc., evitando código duplicado.
# =============================================================================

# --- IMPORTACIÓN DE MÓDULOS --------------------------------------------------
# import pytest: Permite usar decoradores como @pytest.fixture.
import pytest

# import requests: Librería para hacer peticiones HTTP a la API REST.
# Se usa para obtener tokens de autenticación y crear/limpiar datos.
import requests

# from config import ...: Importa las constantes compartidas desde config.py.
# API_BASE: URL base de la API.
# CREDENTIALS: Diccionario con emails y contraseñas de prueba.
from config import API_BASE, CREDENTIALS


# =============================================================================
# FIXTURE: admin_token
# ÁMBITO (scope): "session" → se ejecuta UNA SOLA VEZ para toda la sesión
#                  de pruebas y el resultado se reutiliza en todas las pruebas
#                  que soliciten este fixture.
# PROPÓSITO: Obtener un token JWT de acceso para el usuario administrador.
#            Este token se usa en las pruebas que requieren autenticación
#            con rol de administrador.
# =============================================================================
@pytest.fixture(scope="session")
def admin_token():
    """
    Flujo:
    1. Hace una petición POST al endpoint de login con credenciales de admin.
    2. Verifica que la respuesta sea 200 (OK).
    3. Extrae el accessToken del cuerpo JSON de la respuesta.
    4. Retorna el token para que pytest lo inyecte en las pruebas que lo pidan.
    
    El decorador @pytest.fixture(scope="session") hace que pytest ejecute
    esta función una vez y cachee el resultado. Todas las pruebas que tengan
    un parámetro llamado 'admin_token' recibirán este mismo token.
    """
    # Construye la URL completa: https://...railway.app/api/v1/auth/login
    # Envía el email y password como JSON en el cuerpo de la petición.
    r = requests.post(f"{API_BASE}/auth/login", json=CREDENTIALS["admin"])
    
    # Verifica que el servidor respondió con código HTTP 200 (éxito).
    # Si falla, pytest reporta la prueba como fallida con este mensaje.
    assert r.status_code == 200
    
    # Parsea la respuesta JSON y extrae el campo "accessToken".
    # Retorna el token JWT que se usará en el header Authorization.
    return r.json()["accessToken"]


# =============================================================================
# FIXTURE: cliente_token
# ÁMBITO: "session" (se ejecuta una vez para toda la sesión de pruebas).
# PROPÓSITO: Obtener un token JWT para el usuario con rol "cliente".
#            Similar a admin_token pero con credenciales de cliente.
# =============================================================================
@pytest.fixture(scope="session")
def cliente_token():
    """
    Hace login como cliente y retorna el token de acceso.
    Las pruebas que necesiten actuar como cliente usarán este fixture
    para autenticar sus peticiones a la API.
    """
    r = requests.post(f"{API_BASE}/auth/login", json=CREDENTIALS["cliente"])
    # No se hace assert aquí porque si el login falla, el json() lanzará
    # una excepción que pytest capturará automáticamente.
    return r.json()["accessToken"]


# =============================================================================
# FIXTURE: master_token
# ÁMBITO: "session".
# PROPÓSITO: Obtener un token JWT para el usuario con rol "master".
#            El rol master tiene permisos de superadmin y puede realizar
#            operaciones CRUD completas sobre productos, empleados, etc.
# =============================================================================
@pytest.fixture(scope="session")
def master_token():
    """
    Hace login como master y retorna el token de acceso.
    """
    r = requests.post(f"{API_BASE}/auth/login", json=CREDENTIALS["master"])
    return r.json()["accessToken"]


# =============================================================================
# FIXTURE: auth_header
# ÁMBITO: "function" (se ejecuta para CADA prueba que lo solicita).
#          El ámbito por defecto es "function", por eso no se especifica.
# PROPÓSITO: Crear un diccionario con el header Authorization listo para usar
#            en peticiones HTTP. Evita repetir el formato del header en cada prueba.
# DEPENDENCIA: Requiere el fixture admin_token (pytest lo resuelve automáticamente).
# =============================================================================
@pytest.fixture
def auth_header(admin_token):
    """
    Retorna un diccionario que se puede pasar directamente al parámetro
    'headers' de requests.get(), .post(), etc.
    
    Ejemplo de uso en una prueba:
        def test_algo(self, auth_header):
            r = requests.get(url, headers=auth_header)
    
    El header resultante tendrá la forma:
        {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."}
    """
    return {"Authorization": f"Bearer {admin_token}"}


# =============================================================================
# FIXTURE: created_product_id
# ÁMBITO: "function" (se crea un nuevo producto para cada prueba).
# PROPÓSITO: Crear un producto de prueba en la base de datos, retornar su ID
#            para que las pruebas lo usen, y automáticamente ELIMINARLO
#            (desactivarlo) cuando la prueba termine, usando yield.
# 
# YIELD vs RETURN: Cuando un fixture usa 'yield' en lugar de 'return',
#                  el código antes del yield se ejecuta antes de la prueba
#                  (setup) y el código después del yield se ejecuta después
#                  de la prueba (teardown/cleanup).
# =============================================================================
@pytest.fixture
def created_product_id(admin_token):
    """
    SETUP (antes de la prueba):
    1. Construye el header de autenticación con el token de admin.
    2. Define el payload JSON con los datos del producto a crear.
    3. Hace POST a /api/v1/products para crear el producto.
    4. Verifica que la creación fue exitosa (200 o 201).
    5. Extrae el ID del producto creado.
    6. Con 'yield', entrega el ID a la prueba que lo solicitó.
    
    TEARDOWN (después de la prueba):
    7. Hace DELETE al producto usando el mismo ID, para limpiar.
       El DELETE en este sistema es un "soft delete" (cambia estado
       a inactivo), no elimina físicamente el registro.
    """
    # --- SETUP ---
    
    # Prepara los headers: autenticación + tipo de contenido JSON.
    headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    
    # Datos del producto de prueba.
    # Incluye todos los campos requeridos: nombre, descripción, precio,
    # categoría, stock, destacado y lista de ingredientes.
    payload = {
        "nombre": "Pytest Product",
        "descripcion": "Creado por pytest",
        "precio": 19.99,
        "categoria_id": "631aba10-93be-458a-bd31-c43859ec3c0f",  # Categoría: Entradas
        "stock": 10,
        "destacado": False,
        "ingredientes": ["Ingrediente 1", "Ingrediente 2"],
    }
    
    # Envía la petición POST para crear el producto.
    r = requests.post(f"{API_BASE}/products", json=payload, headers=headers)
    
    # Verifica que el servidor respondió con éxito (200 OK o 201 Created).
    assert r.status_code in (200, 201)
    
    # Extrae el ID del producto recién creado desde la respuesta JSON.
    pid = r.json()["id"]
    
    # --- ENTREGA EL CONTROL A LA PRUEBA ---
    # yield pausa la ejecución del fixture y retorna el ID a la prueba.
    # Cuando la prueba termina (pase o falle), la ejecución continúa
    # desde la línea siguiente a yield.
    yield pid
    
    # --- TEARDOWN (cleanup) ---
    # Desactiva el producto para limpiar la base de datos.
    # El endpoint DELETE hace un soft-delete (estado = inactivo).
    requests.delete(f"{API_BASE}/products/{pid}", headers=headers)
