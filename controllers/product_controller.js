import { Router } from "express"; //IMPORTAMOS ROUTER DE EXPRESS
import Product from "../models/product"; // IMPORTO EL MODELO DEL PRODUCTO
import User from "../models/user"; //USER MODEL
import middleware from "../utils/middleware"; // MIDDLEWARES

const productRouter = Router(); // CREAMOS  EL OBJETO ROUTER

//-------- METODOS -----------------------------------------
/**
 *! GET ALL BLOGS: Ruta para obtener todos los blogs
 */
productRouter.get("/", async (request, response) => {
  // Busca todos los documentos de la colección 'Product'.
  // .populate('user', { userName: 1, name: 1 }) es crucial: reemplaza el ObjectId del campo 'user'
  // con los datos reales del usuario (solo userName y name), facilitando la lectura en el frontend.
  const products = await Product.find({});
  // .populate("user", {
  //   userName: 1,
  //   name: 1,
  // });
  // Envía la lista completa de productos como respuesta JSON.
  response.status(200).json(products);
});

/**
 *! POST NEW PRODUCT: Ruta para crear un nuevo PRODUCTO
 */
productRouter.post(
  "/",
  middleware.tokenExtractor,
  middleware.userExtract,
  async (request, response) => {
    const body = request.body;

    const user = await User.findById(request.user);

    if (!user) {
      return response.status(401).json({ error: "user not found" });
    }

    // Crea una nueva instancia del modelo Product.
    const product = new Product({
      name: body.name,
      stock: body.stock,
      price: body.price,
      // Vincula el blog al usuario: usa el campo 'user' del esquema y guarda el ObjectId del usuario en un array.
      user: user._id,
    });

    // Guarda el nuevo blog en la base de datos MongoDB.
    const result = await product.save();

    // Actualiza el array 'products' del usuario:
    // 1. Concatena el ID del nuevo blog ('result._id') al array 'blogs' del objeto 'user'.
    user.product = user.product.concat(result._id);
    // 2. Guarda los cambios en el documento del usuario en la base de datos.
    await user.save();

    // Responde con el código 201 Created y los datos del blog creado.
    response.status(201).json(result);
  }
);

/**
 *! DELETE 1 BLOG: Ruta para borrar un blog por ID
 */
productRouter.delete(
  "/:id",
  middleware.tokenExtractor,
  middleware.userExtract,
  async (request, response) => {
    const id = request.params.id;
    const product = await Product.findById(id);

    if (!product) {
      return response.status(404).json({ error: "Product not found" });
    }

    if (product.user.toString() === request.user.toString()) {
      await Product.findByIdAndDelete(id);
      return response.status(204).end();
    } else {
      return response.status(401).json({ error: "Unauthorized user" });
    }
  }
);

/**
 *! GET 1 BLOG: Ruta para obtener un blog por ID
 */
productRouter.get(
  "/:id",
  middleware.tokenExtractor,
  middleware.userExtract,
  async (request, response) => {
    // Obtiene el ID del blog de los parámetros de la URL.
    const id = request.params.id;

    // Busca el producto por su ID.
    const product = await Product.findById(id);

    // Si el blog es encontrado (existe):
    if (product) {
      response.json(product); // Devuelve el blog.
    } else {
      // Si no es encontrado (es null), responde con 400 Bad Request.
      // NOTA: 404 Not Found es a menudo más apropiado aquí.
      response.status(400).end();
    }
  }
);

/**
 *! MODIFICATE 1 BLOG: Ruta para actualizar un blog por ID (PATCH/PUT)
 */
productRouter.patch(
  "/:id",
  middleware.tokenExtractor,
  middleware.userExtract,
  async (request, response) => {
    const id = request.params.id;
    const body = request.body; // Datos a actualizar (ej. { likes: 10 })

    try {
      // Busca el blog y aplica las actualizaciones del 'body'.
      // { new: false } indica que devuelva la versión antigua antes de la actualización.
      // { runValidators: true } asegura que las reglas del esquema (ej. minLength) se apliquen a los datos nuevos.
      const updateProduct = await Product.findByIdAndUpdate(id, body, {
        new: false,
        runValidators: true,
      });

      // Si findByIdAndUpdate no encuentra el documento, devuelve null.
      if (!updateProduct) {
        // Devuelve 404 Not Found si el ID no corresponde a ningún blog.
        return response.status(404).json({ error: "Blog not found" });
      }

      // Si la actualización es exitosa, responde con 204 No Content.
      response.status(204).end();
    } catch (error) {
      // Manejo de errores (ej. un valor de likes no válido que falle la validación).
      console.error(error.message);
      // NOTA: Se debería enviar un 400 Bad Request si es un error de validación.
    }
  }
);

// -----------------------------------------------------

export default productRouter; // Exporta el router para usarlo en 'app.js'
