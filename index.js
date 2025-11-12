import app from './app.js'
import config from './utils/config.js'

app.listen(config.PORT, '0.0.0.0', () => {
  console.log('Server is runing on port', config.PORT)
})
