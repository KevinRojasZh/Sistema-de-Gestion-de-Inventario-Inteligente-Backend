# 🧠📦 Sistema de Gestión de Inventario Inteligente (Backend Heavy)

**Desarrollador:** Kevin Rojas

API RESTful **robusta y escalable**, enfocada en la gestión de inventario con **lógica de negocio avanzada**, **rendimiento optimizado** e **integración con IA** (Google Gemini) para clasificación y descripción automática de productos.

---

## 🗺️ I. Visión General y Arquitectura

Demostración de una arquitectura **Node.js / Express.js** sólida.  
Objetivos:

- 🏗️ Implementar lógica empresarial compleja
- 🔒 Validación rigurosa
- ⚡ Rendimiento optimizado
- 🤖 Servicios de IA inteligentes

---

## 🛠️ II. Componentes Clave del Stack

| Componente Clave | Rol Principal | Tecnología / Concepto |
|-----------------|---------------|----------------------|
| 🖥️ Backend Core | Manejo de rutas y lógica RESTful | Node.js, Express.js, Controllers, Services |
| 💾 Base de Datos | Almacenamiento de productos, stock, categorías y metadatos inteligentes | MongoDB / PostgreSQL |
| 🤖 Integración IA | Clasificación y descripción de productos | Google Gemini API |
| 🖼️ Almacenamiento | Subida y almacenamiento seguro de imágenes | AWS S3, Firebase Storage, Cloudinary |
| 📊 Reporting | Generación de documentos exportables | csv-stringify, pdfkit |
| 🧪 Tests | Garantía de fiabilidad y calidad del código | Jest o Mocha/Chai + Supertest |

---

## ✨ III. Funcionalidades Destacadas

### 1️⃣ Creación Inteligente de Producto
El backend orquesta múltiples tareas antes de guardar un producto:

- 🖼️ **Cloud Storage:** Subida segura de imagen (`S3 / Firebase`) y obtención de `imagen_url`.
- 🤖 **IA Generativa:** Invocación a Gemini API para generar `descripcion_corta` y `categoria_sugerida`.
- 💾 **Almacenamiento:** Guardado de datos completos, incluida la respuesta de IA.

### 2️⃣ Escalabilidad y Rendimiento
Endpoint `GET /api/productos` optimizado para miles de registros:

- 📄 **Paginación eficiente:** `page` y `limit`
- 🔍 **Filtros avanzados:** `categoria`, `stockMin`, `stockMax` y `search`

### 3️⃣ Rigor Empresarial y Reporting
- ✅ **Validación crítica:** Unicidad de `numero_serie` y prohibición de stock negativo.
- 📂 **Exportación:** `GET /api/reportes/inventario-csv` genera y fuerza descarga de CSV/PDF.

---

## 🛠️ IV. Hoja de Ruta de Implementación

### ⚙️ Fase 1: Configuración y Backend Base
- ✅ Inicialización: Node.js, Express.js y conexión a DB
- ✅ Modelo de Datos: Esquema completo de `Producto`
- ✅ CRUD Básico: Implementar rutas y controllers

### 🎯 Fase 2: Robustez y Escalabilidad
- 🛡️ Validación con Joi / Express-Validator
- ⚡ Paginación y filtros avanzados en queries

### 🔗 Fase 3: Integración de Servicios Externos
- 🖼️ **Cloud Storage:** Servicio para subir archivos con `multer`  
- 🤖 **IA:** Servicio `iaService.js` para invocar Gemini y generar datos inteligentes

### 🧪 Fase 4: Reporting, Pruebas y Cierre
- 📊 Exportación: `GET /api/reportes/inventario-csv` con Headers HTTP para descarga
- ✅ Tests: Unitarios e integración con Supertest para IA, paginación y errores

---

## 🚀 V. Guía de Configuración Local

### Requisitos
- Node.js v18+
- MongoDB / PostgreSQL
- API Key de Google Gemini
- Credenciales de Cloud Storage

### Instalación
```bash
git clone [URL_DEL_REPOSITORIO]
cd sistema-inventario-inteligente
npm install
Variables de Entorno
Crea un archivo .env:

env
Copiar código
# Configuración del Servidor
PORT=3001
NODE_ENV=development

# Base de Datos
MONGODB_URI=<TU_CADENA_DE_CONEXION_MONGODB>

# Integración con IA
GEMINI_API_KEY=<TU_API_KEY_DE_GEMINI>

# Almacenamiento en la Nube (AWS S3)
AWS_ACCESS_KEY_ID=<TU_CLAVE_DE_ACCESO>
AWS_SECRET_ACCESS_KEY=<TU_CLAVE_SECRETA>
AWS_BUCKET_NAME=<NOMBRE_DEL_BUCKET>
AWS_REGION=us-east-1
Ejecución
bash
Copiar código
npm run dev
API disponible en: http://localhost:3001/api/

