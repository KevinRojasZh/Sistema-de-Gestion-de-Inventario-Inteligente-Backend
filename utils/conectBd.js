import config from './config.js'
import mongoose from 'mongoose'
import info from './logger.js'

const conectToDataBase = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI)
    info('Conected to MongoDB')
  } catch (error) {
    info('Error conecting to MongoDB', error.message)
  }
}

export default {
  conectToDataBase,
}
