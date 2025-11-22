import express from 'express'
import cors from 'cors'
import info from './utils/logger.js'
import bd from './utils/conectBd.js'
import mongoose from 'mongoose'
import middleware from './utils/middleware.js'
import productRouter from './controllers/product_controller.js'
import loginRouter from './controllers/login_controller.js'
import userRouter from './controllers/user_controller.js'
import reportesRouter from './controllers/reportesRouter.js'

const app = express()

mongoose.set('strictQuery', false)

info('Conecting to BD')

bd.conectToDataBase()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/products', productRouter)
app.use('/api/login', loginRouter)
app.use('/api/users', userRouter)
app.use('/api/reports/inventario-csv', reportesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app
