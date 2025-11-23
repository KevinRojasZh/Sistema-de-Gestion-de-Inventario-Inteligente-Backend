
## Autor

Kevin Rojas Desarrollador Full Stack


- [@KevinRojasZh](https://github.com/KevinRojasZh)


# 📦 Sistema de Gestión de Inventario Inteligente (Backend)

🧠 Visión General

Este es un backend profesional para un Sistema de Gestión de Inventarios con funcionalidades avanzadas como:

📤 Subida segura de imágenes a un servicio en la nube (S3).

🤖 Generación de descripción y categoría mediante IA (Gemini).

📄 Exportación de reportes empresariales en formato CSV.

📚 CRUD completo, validaciones avanzadas y reglas de negocio estrictas.

⚡ Paginación y filtros eficientes incluso con miles de productos.

🧪 Testing profesional (unitarios + integración/E2E).

Este proyecto está diseñado como backend heavy para demostrar habilidades profesionales en arquitectura, calidad de código e integración de servicios externos.


## 🛠 Skills
Node.js · Express.js · MongoDB · Mongoose · Google Gemini · Cloud Storage · Node:test + Supertest


## API Reference

#### ¡Para todas las rutas hace falta estar logeado!


#### Getter de todos los productos

```http
GET /api/products
```

#### Paginación & Filtros Avanzados

Permite:
```
page, limit

category

search

stockMin, stockMax

Incluye:

{ "totalItems": 122, "totalPages": 13, "currentPage": 2, "items": [ ... ] }
```
Ejemplo de peticion:
```
/api/products?page=1&limit=2&category=Refrescos&search=fanta&stockMin=10&stockMax=3000
```




#### Getter de un producto

```http
  GET /api/products/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id del producto a gettear |



#### Post de producto
```http
  POST /api/products
```

| Parámetro (Body: Multipart) | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | **Required**. Nombre del producto |
| `price` | `number` | **Required**. Precio del producto |
| `stock` | `number` | **Required**. Cantidad de stock|
| `serial_number` | `string` | **Required**. Numero de serie unico |
| `image` | `file` | **Optional**. Archivo de imagen para subir a Cloud Storage (S3) |

#### Post de usuario 
```http
  POST /api/users
```

| Parámetro (Body: Multipart) | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | **Required**. Nombre del usuario |
| `userName` | `string` | **Required**. Nikname del usuario |
| `password` | `string` | **Required**. Al menos 3 caracteres|

#### Reporte en archivo  CSV

```http
  GET /api/reports/inventario-csv
```





## 🔧 Installation y ejecución



1. Clonar el repositorio git clone https://github.com/tuusuario/inventario-inteligente-backend.git 



2. Instalar dependencias 
```bash
cd inventario-inteligente-backend
npm install 

```

3. Configurar variables de entorno, crear un archivo .env:

4. Ejecutar en modo desarrollo npm run dev

## Variables de entorno

Para ejecutar este proyecto hacen falta las siguientes variables de entorno en un archivo .env

`MONGO_URI=...`

`TEST_MONGODB_URI=...`

`SECRET=...`

`GEMINI_KEY=...`

`AWS_REGION=...`

`AWS_BUCKET=...`

`AWS_KEY=...`

`AWS_SECRET=...`


## License

[MIT](https://choosealicense.com/licenses/mit/)

