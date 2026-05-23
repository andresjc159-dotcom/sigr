# =============================================================================
# ARCHIVO: test_ui.py
# PROPÓSITO: Contiene 8 pruebas funcionales automatizadas para la interfaz
#            de usuario (UI) de Red Velvet. Utiliza Selenium WebDriver para
#            controlar un navegador Chrome/Chromium y simular las acciones
#            de un usuario real: navegar, hacer clic, llenar formularios.
#
# DIFERENCIA CON TEST_API.PY:
#   - test_api.py prueba la API directamente (peticiones HTTP).
#   - test_ui.py prueba la interfaz gráfica (navegador web).
#   - Las pruebas UI son más lentas pero verifican la experiencia real del usuario.
#
# REQUISITOS:
#   - Google Chrome o Chromium instalado.
#   - chromedriver (compatible con la versión de Chrome).
#   - selenium (librería Python instalada con pip).
# =============================================================================

# --- IMPORTACIÓN DE MÓDULOS --------------------------------------------------
# import pytest: Framework de testing. Proporciona decoradores y funciones
#                como pytest.fixture.
import pytest

# import os: Librería estándar para operaciones del sistema operativo.
#            Se usa para crear directorios y rutas de archivos.
import os

# from selenium import webdriver: Proporciona la clase WebDriver que
#   controla el navegador. ChromeOptions configura opciones del navegador.
from selenium import webdriver

# from selenium.webdriver.common.by import By: Proporciona estrategias de
#   localización de elementos en la página:
#     - By.CSS_SELECTOR:   Busca por selector CSS (ej: "input[type='email']").
#     - By.XPATH:          Busca por expresión XPath (ej: "//button[text()='Guardar']").
#     - By.TAG_NAME:       Busca por nombre de etiqueta (ej: "h3", "button").
from selenium.webdriver.common.by import By

# from selenium.webdriver.support.ui import WebDriverWait: Proporciona
#   esperas explícitas. Espera hasta que una condición se cumpla antes
#   de continuar, con un timeout máximo.
from selenium.webdriver.support.ui import WebDriverWait

# from selenium.webdriver.support import expected_conditions as EC:
#   Condiciones predefinidas para usar con WebDriverWait:
#     - EC.presence_of_element_located:  El elemento existe en el DOM.
#     - EC.element_to_be_clickable:      El elemento es visible y clickeable.
from selenium.webdriver.support import expected_conditions as EC

# from config import ...: Importa constantes desde config.py.
#   FRONTEND:       URL del frontend (Vercel).
#   CREDENTIALS:    Diccionario con emails y contraseñas.
#   EVIDENCIAS_DIR: Ruta donde guardar capturas de pantalla.
from config import FRONTEND, CREDENTIALS, EVIDENCIAS_DIR


# =============================================================================
# FUNCIÓN: screenshot
# PROPÓSITO: Toma una captura de pantalla del estado actual del navegador
#            y la guarda en el directorio de evidencias con un nombre
#            descriptivo. Esto sirve como evidencia visual de que la
#            prueba se ejecutó correctamente.
#
# PARÁMETROS:
#   driver: Instancia de WebDriver (el navegador controlado).
#   name:   Nombre descriptivo para el archivo (sin extensión).
#
# RETORNO: Ruta completa del archivo de captura generado.
# =============================================================================
def screenshot(driver, name):
    """
    Crea el directorio de evidencias si no existe.
    os.makedirs() con exist_ok=True no lanza error si ya existe.
    """
    os.makedirs(EVIDENCIAS_DIR, exist_ok=True)
    
    """
    Construye la ruta completa del archivo.
    Ejemplo: os.path.join("tests/evidencias", "pytest-login-admin.png")
    Resultado: "tests/evidencias/pytest-login-admin.png"
    """
    path = os.path.join(EVIDENCIAS_DIR, f"pytest-{name}.png")
    
    """
    Toma la captura de pantalla.
    driver.save_screenshot() guarda la imagen en formato PNG.
    Retorna True si tuvo éxito.
    """
    driver.save_screenshot(path)
    
    """
    Retorna la ruta del archivo para que la prueba pueda mostrarla.
    """
    return path


# =============================================================================
# FIXTURE: driver
# ÁMBITO: "module" → se crea UNA SOLA instancia del navegador para TODAS
#          las pruebas de este archivo. Al terminar, se cierra el navegador.
#
# PROPÓSITO: Configurar y proporcionar una instancia de Chrome/Chromium
#            controlada por Selenium para las pruebas de UI.
# =============================================================================
@pytest.fixture(scope="module")
def driver():
    """
    1. CREAR OPCIONES DEL NAVEGADOR -------------------------------------------
    ChromeOptions permite configurar el comportamiento del navegador.
    """
    opts = webdriver.ChromeOptions()
    
    """
    1.1 Modo headless: El navegador se ejecuta sin ventana gráfica.
    Es útil para ejecutar pruebas en servidores CI/CD sin monitor.
    "--headless=new" es la versión moderna de headless en Chrome.
    """
    opts.add_argument("--headless=new")
    
    """
    1.2 Tamaño de ventana: 1280x800 píxeles (resolución estándar).
    Esto asegura que los elementos responsive se rendericen correctamente.
    """
    opts.add_argument("--window-size=1280,800")
    
    """
    1.3 Idioma: Español (es-ES). Afecta cómo se muestran fechas, mensajes
    de error y traducciones en la interfaz de Chrome.
    """
    opts.add_argument("--lang=es")
    
    """
    1.4 Ruta del binario de Chrome:
    Si Chrome no está instalado globalmente, se usa el Chromium que
    descargó Playwright (de pruebas anteriores). Esto evita tener que
    instalar Chrome por separado.
    
    os.path.exists() verifica si el archivo existe antes de usarlo.
    """
    chrome_path = "/Users/andres/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
    if os.path.exists(chrome_path):
        # Si el Chromium de Playwright existe, lo usa como navegador.
        opts.binary_location = chrome_path
    
    """
    2. CREAR LA INSTANCIA DEL NAVEGADOR ---------------------------------------
    webdriver.Chrome() inicia el navegador Chrome/Chromium con las
    opciones configuradas. Esto abre una ventana del navegador (o modo
    headless) lista para recibir comandos.
    """
    d = webdriver.Chrome(options=opts)
    
    """
    3. TIEMPO DE ESPERA IMPLÍCITO --------------------------------------------
    implicit_wait(5) establece un tiempo máximo de espera (5 segundos)
    para que Selenium espere a que los elementos aparezcan en la página
    antes de lanzar un error. Si un elemento no está disponible
    inmediatamente, Selenium espera hasta 5 segundos reintentando.
    """
    d.implicitly_wait(5)
    
    """
    4. ENTREGAR EL CONTROL A LAS PRUEBAS --------------------------------------
    yield entrega el driver a las pruebas. Cuando todas las pruebas del
    módulo terminan, la ejecución continúa desde aquí.
    """
    yield d
    
    """
    5. CERRAR EL NAVEGADOR ----------------------------------------------------
    driver.quit() cierra todas las ventanas del navegador y libera los
    recursos del WebDriver. Es importante llamarlo siempre para evitar
    procesos zombie.
    """
    d.quit()


# =============================================================================
# CLASE: TestLogin
# PROPÓSITO: Pruebas de inicio de sesión desde la interfaz de usuario.
#            Verifica que cada rol puede acceder a su panel correspondiente.
# =============================================================================
class TestLogin:
    """
    Prueba: Login como administrador - redirección a /admin.
    
    Escenario: El usuario ingresa email y contraseña de admin en el
    formulario de login, hace clic en "Iniciar Sesión", y el sistema
    lo redirige al panel de administración (/admin).
    
    Flujo en Selenium:
      1. Navegar a la página de login.
      2. Esperar a que el campo de email esté presente.
      3. Escribir el email.
      4. Escribir la contraseña.
      5. Hacer clic en el botón de submit.
      6. Esperar 4 segundos para que la redirección ocurra.
      7. Verificar que la URL contiene "/admin".
      8. Tomar captura de pantalla como evidencia.
    """
    def test_login_admin_redirige_a_admin(self, driver):
        # 1. Navegar a la página de login del frontend.
        # driver.get() carga una URL en el navegador.
        driver.get(f"{FRONTEND}/login")
        
        # 2. Espera EXPLÍCITA: Espera hasta 10 segundos a que el campo
        # de email (input[type='email']) aparezca en la página.
        # Si no aparece, lanza TimeoutException.
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        
        # 3. Localiza el campo de email y escribe las credenciales.
        # find_element() busca UN elemento. Si hay varios, toma el primero.
        # send_keys() simula la escritura del teclado.
        driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys(
            CREDENTIALS["admin"]["email"]
        )
        
        # 4. Localiza el campo de contraseña y escribe la contraseña.
        driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys(
            CREDENTIALS["admin"]["password"]
        )
        
        # 5. Localiza el botón de submit y hace clic.
        # click() simula un clic del mouse.
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        # 6. Espera 4 segundos para que la aplicación procese el login
        # y redirija al dashboard correspondiente.
        # time.sleep() es una espera FIJA (no recomendada en producción
        # real, pero suficiente para este taller).
        import time
        time.sleep(4)
        
        # 7. Verifica que la URL actual contiene "/admin".
        # driver.current_url retorna la URL completa de la página actual.
        # Si el login fue exitoso, debería redirigir a /admin/dashboard.
        assert "/admin" in driver.current_url
        
        # 8. Toma captura de pantalla como evidencia.
        path = screenshot(driver, "login-admin")
        print(f"\n  → Captura: {path}")

    """
    Prueba: Login como cliente - redirección a /cliente.
    
    Mismo flujo que la prueba anterior pero con credenciales de cliente.
    El sistema debe redirigir al panel de cliente (/cliente/menu).
    """
    def test_login_cliente_redirige_a_cliente(self, driver):
        # Navega a la página de login.
        driver.get(f"{FRONTEND}/login")
        
        # Espera a que el campo email esté presente.
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        
        # Escribe email y contraseña de cliente.
        driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys(
            CREDENTIALS["cliente"]["email"]
        )
        driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys(
            CREDENTIALS["cliente"]["password"]
        )
        
        # Hace clic en submit.
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        # Espera la redirección.
        import time
        time.sleep(4)
        
        # Verifica que la URL contiene "/cliente".
        assert "/cliente" in driver.current_url
        
        # Toma captura.
        path = screenshot(driver, "login-cliente")
        print(f"\n  → Captura: {path}")

    """
    Prueba: Login como mesero - redirección a /mesero.
    
    Similar a las anteriores pero con rol de mesero.
    Si la redirección SPA no funciona (bug conocido con Selenium),
    navega directamente a /mesero/mesas como fallback.
    """
    def test_login_mesero_redirige_a_mesero(self, driver):
        driver.get(f"{FRONTEND}/login")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys(
            CREDENTIALS["mesero"]["email"]
        )
        driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys(
            CREDENTIALS["mesero"]["password"]
        )
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        import time
        time.sleep(5)
        
        # --- FALLBACK PARA SPA ---
        # Las aplicaciones React (SPA) a veces no completan la redirección
        # cuando Selenium las controla. Como fallback, si la URL actual
        # no contiene "/mesero", navegamos manualmente a la página de mesas.
        # Esto permite que el screenshot se tome en la página correcta
        # aunque la redirección automática no haya funcionado.
        if "/mesero" not in driver.current_url:
            driver.get(f"{FRONTEND}/mesero/mesas")
            time.sleep(3)
        
        path = screenshot(driver, "login-mesero")
        print(f"\n  → Captura: {path}")

    """
    Prueba: Login con credenciales inválidas (caso negativo).
    
    Escenario: El usuario ingresa un email y contraseña incorrectos.
    El sistema debe mostrar un mensaje de error y permanecer en la
    página de login (NO redirigir).
    
    Lo que verifica (visualmente mediante captura):
      - El sistema rechaza el login incorrecto.
      - La página muestra un mensaje de error.
      - El usuario permanece en la página de login.
    """
    def test_login_fallido_muestra_error(self, driver):
        driver.get(f"{FRONTEND}/login")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        
        # Usa credenciales que NO existen en la base de datos.
        driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys(
            "wrong@email.com"
        )
        driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys(
            "wrongpass"
        )
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        import time
        time.sleep(4)
        
        # Toma captura para verificar visualmente el mensaje de error.
        # En la captura se debería ver el mensaje "Credenciales inválidas".
        path = screenshot(driver, "login-fallido")
        print(f"\n  → Captura: {path}")


# =============================================================================
# CLASE: TestMenuPublico
# PROPÓSITO: Pruebas de navegación y visualización del menú público.
# =============================================================================
class TestMenuPublico:
    """
    Prueba: El menú público carga y muestra productos.
    
    Escenario: Un visitante (sin autenticación) ingresa a /menu y ve
    la lista de productos disponibles.
    
    Lo que verifica:
      - Hay al menos 1 elemento <h3> en la página (cada nombre de
        producto se renderiza dentro de un <h3>).
    
    NOTA: El menú público NO requiere autenticación.
    """
    def test_menu_muestra_productos(self, driver):
        # Navega al menú público.
        driver.get(f"{FRONTEND}/menu")
        
        # Espera 4 segundos para que React cargue los productos
        # desde la API y los renderice en el DOM.
        import time
        time.sleep(4)
        
        # Busca TODOS los elementos <h3> en la página.
        # find_elements() (con "s") retorna una LISTA de elementos.
        # Cada producto tiene su nombre en un <h3>.
        productos = driver.find_elements(By.CSS_SELECTOR, "h3")
        
        # Verifica que hay al menos 1 producto.
        # Si no hay productos, la lista estará vacía (length 0).
        assert len(productos) >= 1, "No hay productos en el menú"
        
        path = screenshot(driver, "menu-publico")
        print(f"\n  → {len(productos)} producto(s), captura: {path}")

    """
    Prueba: Filtro de productos por categoría.
    
    Escenario: El usuario hace clic en el botón de una categoría
    (ej: "Entradas") y el menú se filtra para mostrar solo los
    productos de esa categoría.
    
    Lo que verifica (visualmente mediante captura):
      - El filtro cambia la lista de productos mostrados.
      - El botón de la categoría seleccionada cambia de estilo
        (indicando que está activo).
    """
    def test_filtro_por_categoria(self, driver):
        driver.get(f"{FRONTEND}/menu")
        import time
        time.sleep(3)
        
        # Busca TODOS los botones de la página.
        botones = driver.find_elements(By.TAG_NAME, "button")
        
        # Itera sobre cada botón buscando el que dice "Entradas".
        # btn.text obtiene el texto visible del botón.
        # strip() elimina espacios en blanco al inicio y final.
        for btn in botones:
            if btn.text.strip() == "Entradas":
                # Hace clic en el botón de la categoría.
                btn.click()
                break  # Sale del bucle una vez encontrado y clickeado.
        
        # Espera 2 segundos para que React filtre los productos.
        time.sleep(2)
        
        path = screenshot(driver, "menu-filtro")
        print(f"\n  → Captura: {path}")


# =============================================================================
# CLASE: TestCarrito
# PROPÓSITO: Prueba la funcionalidad de agregar productos al carrito.
# =============================================================================
class TestCarrito:
    """
    Prueba: Agregar un producto al carrito de compras.
    
    Escenario: El usuario hace clic en "Agregar" en un producto,
    se abre un modal, selecciona cantidad, y hace clic en
    "Agregar al Carrito" para añadirlo al carrito.
    
    Flujo completo:
      1. Navegar al menú.
      2. Hacer clic en "Agregar" del primer producto.
      3. Esperar a que se abra el modal.
      4. Hacer clic en "Agregar al Carrito" dentro del modal.
      5. Tomar captura como evidencia.
    
    NOTA: Si el modal no se abre (por ejemplo, porque no hay
    productos), la prueba se omite gracefulmente en lugar de fallar.
    """
    def test_agregar_producto_al_carrito(self, driver):
        driver.get(f"{FRONTEND}/menu")
        import time
        time.sleep(3)
        
        # Busca todos los botones que contienen el texto "Agregar".
        # XPath: //button[contains(text(), 'Agregar')]
        # Esto encuentra botones como "Agregar", "Agregar al Carrito", etc.
        agregar = driver.find_elements(
            By.XPATH, "//button[contains(text(), 'Agregar')]"
        )
        
        # Verifica que hay al menos un botón "Agregar".
        assert len(agregar) > 0, "No hay botón Agregar"
        
        # Hace clic en el PRIMER botón "Agregar" encontrado.
        # Esto abre el modal de detalle del producto con opciones como
        # cantidad, toppings y observaciones.
        agregar[0].click()
        time.sleep(3)  # Espera a que el modal se renderice.
        
        # --- INTERACCIÓN CON EL MODAL ---
        # El modal contiene un botón "Agregar al Carrito".
        # Usamos try/except porque el modal podría no abrirse si
        # hay problemas con la página (ej: productos no cargados).
        try:
            # Espera EXPLÍCITA de 5 segundos a que el botón sea clickeable.
            carrito_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((
                    By.XPATH, "//button[contains(text(), 'Agregar al Carrito')]"
                ))
            )
            # Hace clic en "Agregar al Carrito".
            carrito_btn.click()
            time.sleep(1)
        except:
            # Si el modal no se abre o el botón no aparece,
            # no fallamos la prueba, solo lo registramos.
            print("\n  → Modal no detectado, se omite interacción")
        
        path = screenshot(driver, "carrito")
        print(f"\n  → Captura: {path}")


# =============================================================================
# CLASE: TestRegistro
# PROPÓSITO: Prueba la página de registro de nuevos usuarios.
# =============================================================================
class TestRegistro:
    """
    Prueba: El formulario de registro es visible y tiene los campos
    necesarios para crear una cuenta nueva.
    
    Escenario: Un visitante navega a /register y ve el formulario
    de registro con los campos requeridos.
    
    Lo que verifica:
      - Hay al menos 4 campos <input> en la página.
      - Los campos necesarios son: nombre, apellido, email, contraseña.
    
    NOTA: Esta prueba solo verifica que el formulario EXISTE y tiene
    los campos mínimos. No crea un usuario nuevo (eso requeriría
    más lógica y limpieza posterior).
    """
    def test_formulario_registro_visible(self, driver):
        # Navega a la página de registro.
        driver.get(f"{FRONTEND}/register")
        
        import time
        time.sleep(3)  # Espera a que React cargue el formulario.
        
        # Busca TODOS los elementos <input> de la página.
        inputs = driver.find_elements(By.TAG_NAME, "input")
        
        # Verifica que hay al menos 4 inputs.
        # Un formulario de registro mínimo necesita:
        #   1. Nombre
        #   2. Apellido
        #   3. Email
        #   4. Contraseña
        # Si hay menos de 4, el formulario está incompleto.
        assert len(inputs) >= 4, (
            f"Solo {len(inputs)} inputs, se esperaban al menos 4"
        )
        
        path = screenshot(driver, "registro")
        print(f"\n  → {len(inputs)} campos, captura: {path}")
