# Documentación del Proyecto: Inventario con IA y S3

El proyecto es una aplicación **API RESTful** que utiliza **Express.js** y **MongoDB/Mongoose** para gestionar un inventario. Su diseño destaca por la integración de servicios de Inteligencia Artificial (IA) de Google Gemini para la catalogación de productos y la utilización de AWS S3 para el almacenamiento de imágenes.

## I. Configuración y Entorno

La aplicación maneja la configuración a través de variables de entorno, importadas usando `dotenv/config` [1]. La conexión a la base de datos se maneja de forma asíncrona [2].

| Componente              | Valor / Configuración                                                                                                                                                                              | Fuentes |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| **Puerto**              | El servidor se ejecuta en el puerto definido por `process.env.PORT` o, por defecto, en el puerto `3001` [1].                                                                                       | [1]     |
| **Base de Datos (URI)** | La URI de MongoDB (`MONGODB_URI`) es condicional: usa `process.env.TEST_MONGODB_URI` si `NODE_ENV` es `'test'`, y `process.env.MONGODB_URI` en caso contrario [1]. Ambas URIs están definidas [3]. | [1, 3]  |
| **Conexión a DB**       | La función `conectToDataBase` establece la conexión mediante `mongoose.connect(config.MONGODB_URI)` y registra el estado ("Conected to MongoDB" o error) [2].                                      | [2]     |
| **Secreto JWT**         | El secreto utilizado para firmar los JSON Web Tokens (JWT) es `SECRET = 'HOLA'` [3].                                                                                                               | [3]     |
| **Credenciales AWS**    | Se utilizan las variables de entorno `AWS_REGION='eu-north-1'`, `AWS_BUCKET='inventario-images-bucket'`, `AWS_KEY` y `AWS_SECRET` [3].                                                             | [3]     |
| **Clave Gemini**        | La clave de acceso a Google Gemini (`GEMINI_KEY`) está definida [3].                                                                                                                               | [3]     |

## II. Modelado de Datos (Mongoose Schemas)

### A. Esquema de Producto (`Product`)

El esquema de producto define los campos de los artículos de inventario [4].

| Campo            | Tipo       | Requerido                     | Restricciones/Detalles                                      | Fuentes |
| :--------------- | :--------- | :---------------------------- | :---------------------------------------------------------- | :------ |
| `name`           | `String`   | Sí                            | Mínimo 3 caracteres [4]. Validación Joi: Máximo 100 [5].    | [4, 5]  |
| `price`          | `Number`   | Sí                            | Validación Joi: Positivo [5].                               | [4, 5]  |
| `stock`          | `Number`   | Sí                            | Validación Joi: Entero, mínimo 0 [5].                       | [4, 5]  |
| `serial_number`  | `String`   | No especificado en el esquema | Validación Joi: Alfanumérico, min 3, max 30, requerido [5]. | [4, 5]  |
| `description_ia` | `String`   | No                            | Descripción autogenerada por IA [4].                        | [4]     |
| `category_ia`    | `String`   | No                            | Categoría autogenerada por IA [4].                          | [4]     |
| `image_url`      | `String`   | No                            | URL de la imagen [4].                                       | [4]     |
| `user`           | `ObjectId` | No                            | Referencia al modelo `User` (creador del producto) [4].     | [4]     |

- **Índices de Búsqueda:** Se ha definido un índice de texto para permitir búsquedas eficientes en los campos `name`, `category_ia` y `description_ia` [6].
- **Transformación JSON:** Al serializar, se añaden `timestamps` [4], se elimina `_id` y se sustituye por `id` [6].

### B. Esquema de Usuario (`User`)

El esquema de usuario define los campos de los usuarios de la aplicación [7].

| Campo          | Tipo                | Requerido | Restricciones/Detalles                       | Fuentes |
| :------------- | :------------------ | :-------- | :------------------------------------------- | :------ |
| `name`         | `String`            | Sí        |                                              | [7]     |
| `userName`     | `String`            | Sí        | Debe ser único (`unique: true`) [7].         | [7]     |
| `passwordHass` | `String`            | Sí        | Mínimo 3 caracteres [7, 8].                  | [7, 8]  |
| `product`      | `Array de ObjectId` | No        | Lista de productos asociados al usuario [7]. | [7]     |

- **Transformación JSON:** Al serializar, se elimina `_id` (añadiendo `id`) y el campo sensible `passwordHass` [7, 9].

## III. Arquitectura del Servidor y Middleware

El servidor Express [10] utiliza una serie de middlewares para manejar peticiones y errores [11].

| Middleware             | Propósito                                                                                                                                                                              | Detalles | Fuentes |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------ |
| **`requestLogger`**    | Registra el método, ruta y cuerpo de la petición [12].                                                                                                                                 | [12]     |
| **`tokenExtractor`**   | Extrae el token JWT de la cabecera `Authorization` (debe comenzar con `Bearer `) [13]. Devuelve 401 si no hay token o si es inválido [13].                                             | [13]     |
| **`userExtract`**      | Decodifica el token JWT, verifica el ID del usuario y lo asigna a `request.user` [14]. Captura errores de JWT (expirado o inválido) devolviendo 401 [15].                              | [14, 15] |
| **`upload`**           | Middleware de Multer configurado con `memoryStorage()` para manejar la subida de archivos en memoria [16].                                                                             | [16]     |
| **`validationSchema`** | Valida el cuerpo de la petición contra un esquema Joi. Devuelve 400 si la validación falla [16, 17].                                                                                   | [16, 17] |
| **`errorHandler`**     | Manejador central que captura errores de Mongoose (`ValidationError`, `CastError`, duplicados 11000) y errores Joi, devolviendo el código de estado HTTP 400 o 500 apropiado [17, 18]. | [17, 18] |
| **`unknownEndpoint`**  | Maneja rutas no definidas (404 Not Found) [12].                                                                                                                                        | [12]     |

## IV. Endpoints de la API

### A. Gestión de Productos (`/api/products`)

Esta ruta está protegida y requiere autenticación [19-22].

| Método     | Ruta   | Funcionalidad                                                                                                                                                                                                  | Fuentes      |
| :--------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------- |
| **POST**   | `/`    | **Creación** de producto. Utiliza `upload.single('image')` [19]. Sube el archivo a S3 [23] y llama a `analyzeProduct` (IA) para obtener `description_ia` y `category_ia` [23, 24].                             | [19, 23, 24] |
| **GET**    | `/`    | Obtiene productos con **paginación** (`page`, `limit`) [25] y **filtrado**. Soporta búsqueda de texto (`search`) [25], filtrado por categoría (`category`) y por rango de stock (`stockMin`, `stockMax`) [26]. | [25-27]      |
| **DELETE** | `/:id` | **Eliminación** de producto (204). Solo permitido si el usuario autenticado es el creador del producto [20].                                                                                                   | [20]         |
| **PATCH**  | `/:id` | **Actualización** de producto (200). Aplica validación Joi antes de actualizar [22, 28].                                                                                                                       | [22, 28]     |
| **GET**    | `/:id` | Obtiene un producto específico por ID [21].                                                                                                                                                                    | [21]         |

### B. Autenticación y Usuarios

| Método   | Ruta                | Funcionalidad                                                                                                                                    | Fuentes |
| :------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| **POST** | `/api/users/signup` | **Registro** de usuario. Hashea la contraseña (mínimo 3 caracteres) con `bcrypt` (`saltRounds = 10`) antes de guardar [8].                       | [8]     |
| **GET**  | `/api/users`        | Lista todos los usuarios, popularizando los nombres de sus productos asociados [29].                                                             | [29]    |
| **POST** | `/api/login`        | **Inicio de Sesión**. Verifica credenciales [30, 31]. Si es exitoso, genera un JWT con el `id` y `username`, y devuelve el token (200) [32, 33]. | [30-33] |

### C. Reportes

| Método  | Ruta                          | Funcionalidad                                                                                                                                                                                                                    | Fuentes |
| :------ | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| **GET** | `/api/reports/inventario-csv` | Genera y descarga un **reporte CSV** con todos los productos [34]. Utiliza la librería `csv-writer` para crear el archivo en `/tmp/inventario.csv` con cabeceras específicas (ID, Nombre, Precio, Stock, Usuario, etc.) [35-37]. | [34-37] |

## V. Integraciones de Servicios Externos

### A. Google Gemini AI

- **Función:** `analyzeProduct(name)` [38].
- **Modelo:** `gemini-2.5-flash` [38].
- **Lógica:** Genera una descripción corta y una categoría adecuada para el producto basado en su nombre [38].
- **Formato de Salida:** Se requiere que la IA devuelva la respuesta **SOLO JSON** con las claves `"descripcion"` y `"categoria"` [38]. El sistema utiliza una expresión regular para asegurar que se extrae y parsea el JSON válido [39].

### B. AWS S3

- **Función:** `uploadFileToS3(fileBuffer, mimetype)` [40].
- **Proceso de Subida:** Utiliza el `S3Client` y `PutObjectCommand` [40]. Genera un `fileName` único con `crypto.randomUUID()` [40].
- **Resultado:** Tras la subida, devuelve la URL de acceso público del archivo, formateada con el nombre del bucket (`https://[AWS_BUCKET].s3.amazonaws.com/[fileName]`) [41].

## VI. Pruebas

El proyecto cuenta con pruebas robustas de integración y E2E, utilizando `node:test` y `supertest` [42, 43].

### A. Pruebas E2E (End-to-End)

Las pruebas E2E validan la interacción del sistema completo con los servicios externos reales (AWS S3 y Gemini AI) [44].

- **Verificación de Creación:** Se comprueba que, al subir una imagen (`attach('image', ...)`) y datos, se recibe una `image_url` válida de S3 (comenzando con 'http') y valores para `description_ia` y `category_ia` generados por la IA [45, 46].
- **Validaciones:** Se verifica el manejo de errores Joi (ej. falta del campo `name` o `stock` negativo) [47, 48] y errores de base de datos (ej. `serial_number` duplicado, devolviendo 400) [49].

### B. Pruebas de Integración

- **Funcionalidad CRUD:** Verifican la creación exitosa (201) [50], la obtención por ID [51] y la eliminación (204) [52].
- **Paginación y Filtrado:** Se prueba la funcionalidad de paginación [48], el filtrado de texto utilizando `search` [53], y el filtrado por rangos numéricos de stock (`stockMin`, `stockMax`) [53, 54].
