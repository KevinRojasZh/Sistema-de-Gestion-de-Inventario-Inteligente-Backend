import express from 'express'
import cors from 'cors'
import info from './utils/logger.js'
import bd from './utils/conectBd.js'
import mongoose from 'mongoose'


const app = express()

mongoose.set('strictQuery', false)

info('Conecting to BD')

bd.conectToDataBase()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())




export default app