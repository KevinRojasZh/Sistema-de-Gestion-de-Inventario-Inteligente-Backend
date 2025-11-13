import info from './logger.js'
import jwt from 'jsonwebtoken'

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
    return next()
  }
  const decodeToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodeToken.id) {
    throw new Error('Token dont have Id')
  }
  const userId = decodeToken.id
  request.user = userId
  next()
}

const errorHandler = (error, request, response, next) => {
  info('ERROR HANDLER MIDDLEWERE')
  console.error(error)

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

    case 'StockError':
      return response.status(400).json({ error: error.message })

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

export default {
  requestLogger,
  unknownEndpoint,
  tokenExtractor,
  userExtract,
  errorHandler,
  validationSchema,
}
