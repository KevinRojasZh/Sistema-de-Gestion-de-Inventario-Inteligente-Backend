import { Router } from 'express' //IMPORTAMOS ROUTER DE EXPRESS
import Product from '../models/product.js' // IMPORTO EL MODELO DEL PRODUCTO
import User from '../models/user.js' //USER MODEL
import middleware from '../utils/middleware.js' // MIDDLEWARES
import { productValidation } from '../validations/productValidation.js'
import { uploadFileToS3 } from '../services/storageService.js' // Tu función de AWS
import { analyzeProduct } from '../services/isService.js' // Tu función de Gemini AI
import asyncHandler from 'express-async-handler'

const productRouter = Router() // CREAMOS  EL OBJETO ROUTER

//-------- METODOS -----------------------------------------
/**
 *! GET ALL PRODUCTS: Ruta para obtener todos los productos
 */
productRouter.get(
  '/',
  asyncHandler(async (request, response) => {
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
      if (search) filter.$text = { $search: search }

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
        .sort({ createdAt: -1, _id: -1 })
        .populate('user', {
          userName: 1,
          name: 1,
        })

      const totalPages = Math.ceil(totalItems / Number(limit))

      // Enviamos respuesta con metadatos
      response.status(200).json({
        meta: {
          totalItems,
          totalPages,
          currentPage: Number(page),
          itemsPerPage: Number(limit),
        },
        data: products,
      })
    } catch (error) {
      response.status(500).json({ error: 'Error al obtener los productos' })
    }
  }),
)

/**
 *! POST NEW PRODUCT: Ruta para crear un nuevo PRODUCTO
 */
productRouter.post(
  '/',
  middleware.tokenExtractor,
  middleware.userExtract,
  // MULTER: Recibe la imagen y la guarda en req.file (memoria).
  middleware.upload.single('image'),
  // VALIDACIÓN: Valida los campos name, stock, price, etc.
  middleware.validationSchema(productValidation),
  asyncHandler(async (request, response) => {
    // Desestructuración de datos
    const body = request.body
    //Buscamos el usuario ya que el middleware nos seta el id que viene en el token
    const user = await User.findById(request.user)

    // Si el usuario no es encontrado retornamos un error 401
    if (!user) {
      return response.status(401).json({ error: 'user not found' })
    }

    let imageUrl = null

    //  SUBIDA A S3: Se ejecuta si Multer encontró un archivo.
    if (request.file) {
      imageUrl = await uploadFileToS3(
        request.file.buffer,
        request.file.mimetype,
      )
    }

    // IA: Autogenerar descripción y categoría usando el nombre.
    // Usamos el nombre que vino del body
    const iaResult = await analyzeProduct(body.name)

    //  CREACIÓN FINAL DEL PRODUCTO
    const product = new Product({
      name: body.name,
      stock: body.stock,
      price: body.price,
      serial_number: body.serial_number,

      // Datos de la IA
      description_ia: iaResult.descripcion,
      category_ia: iaResult.categoria,

      // Datos de S3
      image_url: imageUrl,

      // Datos del usuario (del middleware)
      user: user._id,
    })

    // Guarda y popula
    let result = await product.save()
    user.product = user.product.concat(result._id)
    await user.save()

    result = await result.populate('user', { name: 1 })

    response.status(201).json(result)
  }),
)

/**
 *! DELETE 1 PRODUCT: Ruta para borrar un blog por ID
 */
productRouter.delete(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtract,
  asyncHandler(async (request, response) => {
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
  }),
)

/**
 *! GET 1 PRODUCT: Ruta para obtener un producto por ID
 */
productRouter.get(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtract,
  asyncHandler(async (request, response) => {
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
  }),
)

/**
 *! MODIFICATE 1 PRODUCT: Ruta para actualizar un blog por ID (PATCH/PUT)
 */
productRouter.patch(
  '/:id',
  middleware.tokenExtractor,
  middleware.userExtract,
  middleware.validationSchema(productValidation),
  asyncHandler(async (request, response) => {
    const id = request.params.id
    const body = request.body // Datos a actualizar (ej. { likes: 10 })

    try {
      // Busca el blog y aplica las actualizaciones del 'body'.
      // { new: false } indica que devuelva la versión antigua antes de la actualización.
      // { runValidators: true } asegura que las reglas del esquema (ej. minLength) se apliquen a los datos nuevos.
      const updateProduct = await Product.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      })

      // Si findByIdAndUpdate no encuentra el documento, devuelve null.
      if (!updateProduct) {
        // Devuelve 404 Not Found si el ID no corresponde a ningún blog.
        return response.status(404).json({ error: 'Blog not found' })
      }

      // Si la actualización es exitosa, responde con 204 No Content.
      response.status(200).json(updateProduct)
    } catch (error) {
      // Manejo de errores (ej. un valor de likes no válido que falle la validación).
      next(error)
    }
  }),
)

// -----------------------------------------------------

export default productRouter // Exporta el router para usarlo en 'app.js'
