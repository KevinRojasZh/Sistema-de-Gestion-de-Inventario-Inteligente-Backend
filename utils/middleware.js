import info from './logger.js'
import jwt from 'jsonwebtoken'
import multer from 'multer'

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (request, response, next) => {
  const token = request.get('Authorization')
  if (!token) {
    return response.status(401).json({ error: 'Dont have TOKEN' })
  }
  if (token.startsWith('Bearer ')) {
    const cleanToken = token.replace('Bearer ', '')
    request.token = cleanToken
  } else {
    return response.status(401).json({ error: 'Token invalid' })
  }
  next()
}

const userExtract = (request, response, next) => {
  if (!request.token) {
    // Si no hay token, simplemente pasamos al siguiente middleware o ruta.
    return next()
  }

  try {
    // jwt.verify() lanza un error SÍNCRONO si el token es inválido o expirado.
    const decodeToken = jwt.verify(request.token, process.env.SECRET)

    if (!decodeToken.id) {
      // Usamos return response.status(401).json(...) en lugar de throw
      // para manejar el error de forma inmediata y explícita.
      return response.status(401).json({ error: 'Token invalid: ID missing' })
    }

    const userId = decodeToken.id
    request.user = userId

    // Si todo es exitoso, continuamos.
    next()
  } catch (error) {
    // 💡 Capturamos los errores síncronos lanzados por jwt.verify (JsonWebTokenError, TokenExpiredError).

    // Si es un error de JWT, devolvemos 401.
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return response.status(401).json({ error: 'Token missing or invalid' })
    }

    // Si es otro error desconocido, lo pasamos al manejador de errores global.
    next(error)
  }
}

const errorHandler = (error, request, response, next) => {
  info('ERROR HANDLER MIDDLEWERE')
  console.error(error)
  // 1. Manejo de Errores con Código de Estado HTTP (Lanzados en el router)
  // Si el error tiene una propiedad 'status' (e.g., 401, 404, 500)
  if (error.status && error.message) {
    return response.status(error.status).json({ error: error.message })
  }
  // Si tiene un 'statusCode' (a veces usado por librerías)
  if (error.statusCode && error.message) {
    return response.status(error.statusCode).json({ error: error.message })
  }

  if (error.isJoi) {
    return response.status(400).json({ error: error.details[0].message })
  }

  switch (error.name) {
    case 'ValidationError':
      return response.status(400).json({ error: error.message })

    case 'MongoServerError':
      if (error.code === 11000) {
        return response
          .status(400)
          .json({ error: `Campo duplicado: ${Object.keys(error.keyValue)}` })
      }
      return response.status(500).json({ error: 'Error en la base de datos' })

    case 'CastError':
      return response
        .status(400)
        .json({ error: `ID malformado: ${error.value}` })

    default:
      return response.status(500).json({ error: 'Error interno del servidor' })
  }
}

const validationSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    if (error) {
      const formattedErrors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }))
      return res.status(400).json({
        error: 'Datos inválidos',
        details: formattedErrors,
      })
    }
    next()
  }
}

const storage = multer.memoryStorage()

const upload = multer({ storage })

export default {
  requestLogger,
  unknownEndpoint,
  tokenExtractor,
  userExtract,
  errorHandler,
  validationSchema,
  upload,
}
