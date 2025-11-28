Documentación del Proyecto: Inventario con IA y S3
El proyecto es una API RESTful desarrollada con Express.js y MongoDB/Mongoose, diseñada para la gestión de inventario automatizado, integrando servicios de Inteligencia Artificial (IA) de Google Gemini para la catalogación y AWS S3 para el almacenamiento de archivos.
I. Configuración y Entorno
La configuración del entorno se gestiona a través de variables de entorno (usando dotenv/config). La conexión a la base de datos es asíncrona y se inicializa al arrancar el servidor.
Componente
Configuración
Puerto
El servidor se ejecuta en el puerto 3001 o el definido por process.env.PORT.
Base de Datos (URI)
La URI de MongoDB (MONGODB_URI) se selecciona condicionalmente, utilizando una URI de prueba (TEST_MONGODB_URI) si NODE_ENV es 'test'.
Conexión a DB
La función conectToDataBase establece la conexión con Mongoose y notifica el estado de la conexión.
Secreto JWT
El secreto utilizado para firmar los JSON Web Tokens es SECRET = 'HOLA'.
Credenciales AWS
Se requieren AWS_REGION='eu-north-1', AWS_BUCKET='inventario-images-bucket', AWS_KEY y AWS_SECRET.
Clave Gemini
La clave de acceso a Google Gemini (GEMINI_KEY) está definida.
II. Modelado de Datos (Mongoose Schemas)
A. Esquema de Producto (Product)
Define los campos de los artículos de inventario.
Campo
Tipo
Requerido
Restricciones/Detalles
name
String
Sí
Mínimo 3, máximo 100 caracteres.
price
Number
Sí
Debe ser positivo.
stock
Number
Sí
Debe ser entero, mínimo 0.
serial_number
String
Sí (Joi)
Alfanumérico, entre 3 y 30 caracteres.
description_ia
String
No
Descripción autogenerada por IA.
category_ia
String
No
Categoría autogenerada por IA.
image_url
String
No
URL de la imagen (S3).
user
ObjectId
No
Referencia al usuario creador.
• Índices: Se utiliza un índice de texto para permitir búsquedas eficientes en name, category_ia y description_ia.
• Transformación JSON: Se añade id y se eliminan \_id y versionKey.
B. Esquema de Usuario (User)
Define a los usuarios de la aplicación.
Campo
Tipo
Requerido
Restricciones/Detalles
name
String
Sí
userName
String
Sí
Debe ser único.
passwordHass
String
Sí
Mínimo 3 caracteres.
product
Array de ObjectId
No
Lista de productos creados por el usuario.
• Transformación JSON: Se eliminan \_id (añadiendo id) y el campo passwordHass de la respuesta JSON.
III. Arquitectura y Middleware
El servidor Express utiliza varios middlewares para la gestión de peticiones, validación y seguridad.
Middleware
Propósito
Detalles
cors()
Habilita las peticiones de origen cruzado.
express.static('dist')
Sirve los archivos estáticos (frontend).
requestLogger
Registra el método, ruta y cuerpo de la petición.
tokenExtractor
Extrae el token JWT (requiere Bearer en la cabecera Authorization). Devuelve 401 si el formato es inválido o falta.
userExtract
Verifica el token, decodifica el ID del usuario y lo asigna a request.user. Maneja errores de JWT (expiración, firma inválida) devolviendo 401.
upload
Middleware de Multer configurado con memoryStorage() para manejar la subida de archivos en memoria.
validationSchema
Valida el cuerpo de la petición contra un esquema Joi. Devuelve 400 en caso de fallo.
errorHandler
Captura y formatea errores (Mongoose, Joi). Maneja errores de validación, IDs malformados (CastError) y campos duplicados (código 11000), devolviendo 400 o 500.
unknownEndpoint
Maneja rutas no definidas (404 Not Found).
IV. Endpoints de la API
A. Gestión de Productos (/api/products)
Esta ruta está protegida por autenticación JWT.
Método
Ruta
Funcionalidad
POST
/
Creación de producto. Utiliza upload.single('image'). Sube el archivo a S3 y llama a la IA para categorizar y describir.
GET
/
Obtiene productos con paginación (page, limit). Soporta filtrado por búsqueda de texto (search), categoría (category) y rango de stock (stockMin, stockMax).
GET
/:id
Obtiene un producto específico por ID.
DELETE
/:id
Eliminación de producto (204). Solo permitido si el usuario autenticado es el creador del producto.
PATCH
/:id
Actualización de producto (200). Aplica validación Joi.
B. Autenticación y Usuarios
Método
Ruta
Funcionalidad
POST
/api/users/signup
Registro de usuario. La contraseña (mínimo 3 caracteres) se hashea con bcrypt (saltRounds = 10).
GET
/api/users
Lista todos los usuarios, incluyendo los nombres de sus productos asociados (población).
POST
/api/login
Inicio de Sesión. Verifica credenciales. Si es exitoso, genera un JWT con el id y username, y devuelve el token (200).
C. Reportes
Método
Ruta
Funcionalidad
GET
/api/reports/inventario-csv
Genera y descarga un reporte en formato CSV. Obtiene todos los productos y utiliza csv-writer para crear el archivo /tmp/inventario.csv con cabeceras formateadas.
V. Integraciones de Servicios Externos
A. Google Gemini AI (Análisis de Productos)
• Función: analyzeProduct(name).
• Modelo: gemini-2.5-flash.
• Propósito: Generar una descripción corta y una categoría adecuada basándose en el nombre del producto.
• Formato de Salida: Se exige a la IA que devuelva la respuesta estrictamente en formato JSON con las claves "descripcion" y "categoria". Se utiliza una expresión regular para extraer el JSON válido de la respuesta de la IA.
B. AWS S3 (Almacenamiento de Imágenes)
• Función: uploadFileToS3(fileBuffer, mimetype).
• Proceso: Utiliza el S3Client y un comando PutObjectCommand. Genera un nombre de archivo único (crypto.randomUUID()) antes de la subida.
• Resultado: Devuelve la URL de acceso público al archivo subido en el bucket de S3.
VI. Pruebas
El proyecto cuenta con pruebas robustas de integración y End-to-End (E2E) utilizando node:test y supertest.
A. Alcance de las Pruebas
• Pruebas E2E: Verifican la integración con servicios externos reales (S3 y Gemini IA). Se comprueba que la creación de un producto resulta en una URL de S3 válida y campos de IA poblados, y que el endpoint responde en menos de 6 segundos.
• Validaciones y Errores: Se verifican fallos de validación (ej. falta del campo name, stock negativo) y fallos de unicidad de base de datos (ej. serial_number duplicado), asegurando que devuelvan el código 400 Bad Request.
• Funcionalidades: Se prueban la paginación, el filtrado de texto (usando search) y el filtrado por rangos de stock.
• Flujo de Autenticación: Las pruebas incluyen la limpieza de la base de datos, la creación de un usuario de prueba, el inicio de sesión y el uso del token de autenticación (tokenUser) en las peticiones subsiguientes.
