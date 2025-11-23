# 📘 Documentación del Backend – Inventario Inteligente

Bienvenido a la documentación oficial del **backend de Inventario Inteligente**. Aquí encontrarás toda la información necesaria para instalar, configurar y ejecutar el proyecto correctamente.

---

## 🚀 Descripción General

Este backend provee una API diseñada para gestionar inventarios mediante:

- Registro de productos con texto o imágenes.
- Actualización inteligente de datos usando IA.
- Sistema de almacenamiento en la nube para imágenes.
- Integración con base de datos MongoDB.

El servidor está construido con **Node.js**, **Express**, **MongoDB**, e integra modelos de IA de Google Gemini para procesar y generar información.

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/inventario-inteligente-backend.git
cd inventario-inteligente-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo **.env** en la raíz del proyecto con las siguientes variables:

```ini
PORT=3000
MONGO_URI=tu_conexion_mongodb
GEMINI_API_KEY=tu_api_key
CLOUD_STORAGE_KEY=tu_cloud_key
CLOUD_STORAGE_SECRET=tu_cloud_secret
CLOUD_STORAGE_BUCKET=tu_bucket
```

---

## ▶️ Scripts disponibles

### Iniciar el servidor en modo desarrollo

```bash
npm run dev
```

### Iniciar el servidor en modo producción

```bash
npm start
```

---

## 🔌 Endpoints Principales

### **POST /api/products**

Registrar un nuevo producto mediante texto o imagen.

### **GET /api/products**

Obtener todos los productos registrados.

### **GET /api/products/:id**

Obtener los datos de un producto específico.

### **PUT /api/products/:id**

Actualizar información de un producto.

### **DELETE /api/products/:id**

Eliminar un producto.

---

## ☁️ Almacenamiento en la Nube

Las imágenes se suben automáticamente a un proveedor de almacenamiento (Cloudinary o similar, según configuración) usando las claves definidas en el archivo `.env`.

---

## 🤖 Procesamiento con IA

El proyecto incluye integración con **Google Gemini** para:

- Analizar imágenes de productos.
- Extraer texto o información relevante.
- Generar descripciones o etiquetas.

---

## 📦 Estructura del Proyecto

```
inventario-inteligente-backend/
│── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   └── app.js
│
├── .env
├── package.json
├── README.md
└── server.js
```

---

## 📝 Notas Finales

- Asegúrate de tener tu base de datos ejecutándose antes de iniciar el servidor.
- No compartas tu archivo `.env` públicamente.
- Si necesitas ayuda adicional, puedes crear un issue en el repositorio.

---

Si deseas añadir ejemplos de uso, diagramas, o una sección de despliegue en producción, puedo generarlos también.
