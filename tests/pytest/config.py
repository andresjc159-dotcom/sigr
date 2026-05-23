# =============================================================================
# ARCHIVO: config.py
# PROPÓSITO: Almacena todas las constantes y configuraciones compartidas
#            que utilizan los archivos de prueba (test_api.py y test_ui.py).
#            Centralizar las URLs y credenciales aquí permite cambiar
#            los entornos de prueba modificando solo este archivo.
# =============================================================================

# --- URL BASE DE LA API ------------------------------------------------------
# Esta es la URL raíz de todos los endpoints del backend.
# El backend está desplegado en Railway e incluye el prefijo /api/v1.
# Todas las pruebas de API construirán sus rutas a partir de esta base.
# Ejemplo: API_BASE + "/auth/login" = "https://...railway.app/api/v1/auth/login"
API_BASE = "https://loyal-smile-production-2893.up.railway.app/api/v1"

# --- URL DEL FRONTEND --------------------------------------------------------
# Esta es la URL de la aplicación frontend desplegada en Vercel.
# Las pruebas de UI (Selenium) navegarán a esta URL para interactuar
# con la interfaz de usuario como si fuera un usuario real.
FRONTEND = "https://frontend-chi-five-62.vercel.app"

# --- CREDENCIALES DE PRUEBA --------------------------------------------------
# Diccionario que contiene las credenciales de cada rol del sistema.
# Cada entrada tiene un email y una contraseña.
# Estas credenciales fueron insertadas en la base de datos Neon durante
# la inicialización del proyecto (seedUsers.js / schema.sql).
# Los roles disponibles son:
#   - admin:    acceso al panel de administración
#   - cliente:  acceso al panel de cliente
#   - mesero:   acceso al panel de mesero
#   - master:   acceso al panel master (superadmin)
CREDENTIALS = {
    "admin": {"email": "admin@redvelvet.com", "password": "admin123"},
    "cliente": {"email": "cliente@redvelvet.com", "password": "cliente123"},
    "mesero": {"email": "mesero1@redvelvet.com", "password": "mesero123"},
    "master": {"email": "master@redvelvet.com", "password": "master123"},
}

# --- IDs DE REFERENCIA -------------------------------------------------------
# Estos UUIDs corresponden a registros existentes en la base de datos Neon.
# Se usan en las pruebas para crear productos y órdenes sin tener que
# consultar primero los IDs disponibles.

# ID de la categoría "Entradas" en la tabla categorias.
# Se usa al crear productos para asignarles una categoría válida.
CATEGORIA_ENTRADAS = "631aba10-93be-458a-bd31-c43859ec3c0f"

# ID de la Mesa #1 (Terraza, capacidad 2) en la tabla mesas.
# Se usa al crear órdenes de tipo "local" para asignar una mesa.
MESA_ID = "bfa7e71d-c1d7-4ba0-a665-730d0acf2173"

# --- DIRECTORIO DE EVIDENCIAS ------------------------------------------------
# Ruta relativa donde se guardarán las capturas de pantalla tomadas
# durante las pruebas de UI con Selenium.
# El directorio se crea automáticamente si no existe.
EVIDENCIAS_DIR = "tests/evidencias"
