import express from 'express'
import cors from 'cors'
import info from './utils/logger.js'
import bd from './utils/conectBd.js'
import mongoose from 'mongoose'
import middleware from './utils/middleware.js'


const app = express()

mongoose.set('strictQuery', false)

info('Conecting to BD')

bd.conectToDataBase()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)




app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)



export default app