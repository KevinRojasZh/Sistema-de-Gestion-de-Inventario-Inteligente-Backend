📦 Sistema de Gestión de Inventario Inteligente (Backend)

Desarrollado por: Kevin Rojas
Tecnologías: Node.js · Express.js · MongoDB · Mongoose · Google Gemini · Cloud Storage · Node:test + Supertest

🧠 Visión General

Este es un backend profesional para un Sistema de Gestión de Inventarios con funcionalidades avanzadas como:

📤 Subida segura de imágenes a un servicio en la nube (S3).

🤖 Generación de descripción y categoría mediante IA (Gemini).

📄 Exportación de reportes empresariales en formato CSV.

📚 CRUD completo, validaciones avanzadas y reglas de negocio estrictas.

⚡ Paginación y filtros eficientes incluso con miles de productos.

🧪 Testing profesional (unitarios + integración/E2E).

Este proyecto está diseñado como backend heavy para demostrar habilidades profesionales en arquitectura, calidad de código e integración de servicios externos.

🚀 Características Principales
✔ 1. Creación Inteligente de Productos

Endpoint: POST /api/products

El backend:

Sube la imagen a la nube → genera imagen_url.

Llama a Gemini para generar:

descripcion_ia

categoria_ia

Guarda todo en la base de datos.

✔ 2. Paginación & Filtros Avanzados

Endpoint: GET /api/products

Permite:

page, limit

categoria

search

stockMin, stockMax

Incluye:

{
  "totalItems": 122,
  "totalPages": 13,
  "currentPage": 2,
  "items": [ ... ]
}

✔ 3. Validaciones Empresariales

numero_serie único garantizado.

El stock no puede quedar negativo.

Validaciones con Joi.

Respuestas de error bien definidas (400 / 404 / 500).

✔ 4. Exportación de Reportes (CSV)

Endpoint: GET /api/reports/inventario-csv

Exporta todo el inventario completo, sin paginación.

Devuelve un archivo descargable vía:

Content-Type: text/csv

Content-Disposition: attachment; filename="inventario.csv"

✔ 5. Testing Profesional

Frameworks utilizados:

Tests Unitarios: validaciones, funciones internas, lógica de negocio.

Tests de Integración/E2E:

Creación de producto con imagen + IA

Validación y errores

Paginar y filtrar

Exportación de CSV

**
🏗️ Arquitectura del Proyecto
/src
 ├── controllers/
 ├── models/
 ├── routes/
 ├── services/
 │    ├── iaService.js     // Gemini
 │    ├── uploadService.js // s3
 ├── middleware/
 ├── tests/
 │    ├── integration.test.js
 │    ├── unit.test.js
 ├── app.js
 └── server.js

**

🔧 Instalación y Ejecución
1. Clonar el repositorio
git clone https://github.com/tuusuario/inventario-inteligente-backend.git
cd inventario-inteligente-backend

2. Instalar dependencias
npm install

3. Configurar variables de entorno

Crear un archivo .env:

PORT=3000
MONGO_URI=...
GEMINI_API_KEY=...
CLOUD_STORAGE_KEY=...

4. Ejecutar en modo desarrollo
npm run dev

🧪 Ejecutar Tests
npm test

📡 Endpoints Principales
Productos
Método	Endpoint	Descripción
POST	/api/products	Crear producto con IA + imagen
GET	/api/products	Listar productos con paginación & filtros
GET	/api/products/:id	Obtener un producto
PUT	/api/products/:id	Actualizar producto
DELETE	/api/products/:id	Eliminar producto
Reportes
Método	Endpoint	Descripción
GET	/api/reportes/inventario-csv	Descargar inventario completo (CSV)
📄 Licencia

MIT License.

✨ Autor

Kevin Rojas
Desarrollador Full Stack
