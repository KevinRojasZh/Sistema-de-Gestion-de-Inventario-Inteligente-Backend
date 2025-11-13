import { Router } from 'express' //IMPORTAMOS ROUTER DE EXPRESS
import Product from '../models/product.js' // IMPORTO EL MODELO DEL PRODUCTO
import User from '../models/user.js' //USER MODEL
import middleware from '../utils/middleware.js' // MIDDLEWARES
import productValidation from '../validations/productValidation.js'

const productRouter = Router() // CREAMOS  EL OBJETO ROUTER

//-------- METODOS -----------------------------------------
/**
 *! GET ALL PRODUCTS: Ruta para obtener todos los productos
 */
productRouter.get('/', async (request, response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      stockMin,
      stockMax,
    } = request.query
    const filter = {}
    // búsqueda parcial (insensible a mayúsculas)
    if (search) filter.name = { $regex: search, $options: 'i' }

    // búsqueda por categoria
    if (category) filter.category_ia = category

    // busqueda por min o max de stock
    if (stockMin || stockMax) {
      filter.stock = {}
      if (stockMin) filter.stock.$gte = Number(stockMin)
      if (stockMax) filter.stock.$lte = Number(stockMax)
    }
    // Calculamos paginación
    const skip = (Number(page) - 1) * Number(limit)

    // Obtenemos total de productos y los resultados de la página
    const totalItems = await Product.countDocuments(filter)
    const products = await Product.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate('user', {
        userName: 1,
        name: 1,
      })

    const totalPages = Math.ceil(totalItems / Number(limit))

    // Enviamos respuesta con metadatos
    res.json({
      meta: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        itemsPerPage: Number(limit),
      },
      data: products,
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' })
  }
  const products = await Product.find({}).populate('user', {
    userName: 1,
    name: 1,
  })
  // Envía la lista completa de productos como respuesta JSON.
  response.status(200).json(products)
})

/**
 *! POST NEW PRODUCT: Ruta para crear un nuevo PRODUCTO
 */
productRouter.post(
  '/',
  middleware.tokenExtractor,
  middleware.userExtract,
  middleware.validationSchema(productValidation),
  async (request, response) => {
    const body = request.body

    const user = await User.findById(request.user)

    if (!user) {
      return response.status(401).json({ error: 'user not found' })
    }

    // Crea una nueva instancia del modelo Product.
    const product = new Product({
      name: body.name,
      stock: body.stock,
      price: body.price,
      serial_number: body.serial_number,
      description_ia: body.description_ia,
      category_ia: body.category_ia,
      image_url: body.image_url,
      // Vincula el producto al usuario: usa el campo 'user' del esquema y guarda el ObjectId del usuario en un array.
      user: user._id,
    })

    // Guarda el nuevo producto en la base de datos MongoDB.
    const result = await product.save()

    // Actualiza el array 'products' del usuario:
    // 1. Concatena el ID del nuevo producto ('result._id') al array 'products' del objeto 'user'.
    user.product = user.product.concat(result._id)
    // 2. Guarda los cambios en el documento del usuario en la base de datos.
    await user.save()

    // Responde con el código 201 Created y los datos del PRODUCTO creado.
    response.status(201).json(result)
  },
)

/**
 *! DELETE 1 PRODUCT: Ruta para borrar un blog por ID
 */
productRouter.delete(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtract,
  async (request, response) => {
    const id = request.params.id
    const product = await Product.findById(id)

    if (!product) {
      return response.status(404).json({ error: 'Product not found' })
    }

    if (product.user.toString() === request.user.toString()) {
      await Product.findByIdAndDelete(id)
      return response.status(204).end()
    } else {
      return response.status(401).json({ error: 'Unauthorized user' })
    }
  },
)

/**
 *! GET 1 PRODUCT: Ruta para obtener un blog por ID
 */
productRouter.get(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtract,
  async (request, response) => {
    // Obtiene el ID del blog de los parámetros de la URL.
    const id = request.params.id

    // Busca el producto por su ID.
    const product = await Product.findById(id)

    // Si el blog es encontrado (existe):
    if (product) {
      response.json(product) // Devuelve el blog.
    } else {
      // Si no es encontrado (es null), responde con 400 Bad Request.
      // NOTA: 404 Not Found es a menudo más apropiado aquí.
      response.status(400).end()
    }
  },
)

/**
 *! MODIFICATE 1 PRODUCT: Ruta para actualizar un blog por ID (PATCH/PUT)
 */
productRouter.patch(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtract,
  async (request, response) => {
    const id = request.params.id
    const body = request.body // Datos a actualizar (ej. { likes: 10 })

    try {
      // Busca el blog y aplica las actualizaciones del 'body'.
      // { new: false } indica que devuelva la versión antigua antes de la actualización.
      // { runValidators: true } asegura que las reglas del esquema (ej. minLength) se apliquen a los datos nuevos.
      const updateProduct = await Product.findByIdAndUpdate(id, body, {
        new: false,
        runValidators: true,
      })

      // Si findByIdAndUpdate no encuentra el documento, devuelve null.
      if (!updateProduct) {
        // Devuelve 404 Not Found si el ID no corresponde a ningún blog.
        return response.status(404).json({ error: 'Blog not found' })
      }

      // Si la actualización es exitosa, responde con 204 No Content.
      response.status(204).end()
    } catch (error) {
      // Manejo de errores (ej. un valor de likes no válido que falle la validación).
      console.error(error.message)
      // NOTA: Se debería enviar un 400 Bad Request si es un error de validación.
    }
  },
)

// -----------------------------------------------------

export default productRouter // Exporta el router para usarlo en 'app.js'
