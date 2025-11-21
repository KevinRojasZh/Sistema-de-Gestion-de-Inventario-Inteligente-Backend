import { describe, beforeEach, test, after, before } from 'node:test'
import supertest from 'supertest'
import mongoose from 'mongoose'
import assert from 'assert'
import app from '../app.js'
import Product from '../models/product.js'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import path from 'path'
import fs from 'fs' // <-- Importar 'fs' para verificar el archivo

const api = supertest(app)
let tokenUser = ''

// Ajustar la ruta si es necesario, basándose en la estructura común
// Asumiendo que 'tests' está en la raíz del proyecto.
const imageTestPath = path.join(
  process.cwd(),
  'tests',
  'files',
  'test-image.png',
)

// Abrir la conexión una sola vez antes de todos los tests.
before(async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('Verificando conexión de Mongoose en E2E suite...')
  }
})

// Cerrar la conexión una sola vez después de todos los tests.
after(async () => {
  await mongoose.connection.close()
  console.log('\nConexión a MongoDB cerrada después de la suite E2E.')
})

// ====================================================================
// SUITE E2E CON SERVICIOS REALES
// ====================================================================

describe(
  'POST /api/products - E2E con S3 real + IA real',
  { timeout: 50000 },
  () => {
    beforeEach(async () => {
      // Limpieza de colecciones
      await User.deleteMany({})
      await Product.deleteMany({})

      // Crear usuario real
      const passwordHash = await bcrypt.hash('1234', 10)
      await User.create({
        userName: 'inventario',
        name: 'kevin rojas',
        passwordHass: passwordHash,
      })

      // Login real
      const login = await api
        .post('/api/login')
        .send({ userName: 'inventario', password: '1234' })
        .expect(200)

      tokenUser = `Bearer ${login.body.token}`
    })

    test(
      'Crea un producto usando S3 real y IA real',
      { timeout: 50000 },
      async () => {
        // --- VERIFICACIÓN DE EXISTENCIA DE ARCHIVO ---
        if (!fs.existsSync(imageTestPath)) {
          // Este error será explícito si la ruta es incorrecta
          throw new Error(`CRITICAL ERROR: The file path is incorrect or the file does not exist: ${imageTestPath}. 
            Please ensure 'tests/files/test-image.jpg' exists in your project structure.`)
        }
        // -----------------------------------------------------------------

        const response = await api
          .post('/api/products')
          .set('Authorization', tokenUser)
          // único elemento que debe ser 'attach'
          .attach('image', imageTestPath)
          .field('name', 'Lavadora')
          .field('price', '99.99')
          .field('stock', '10')
          .field('serial_number', 'REAL001')
          .timeout(45000) // Timeout de Supertest: 45 segundos (más robusto)
          .expect(201)

        // Validaciones mínimas (la IA devuelve valores reales)
        assert.ok(response.body.image_url.startsWith('http')) // Verifica URL de S3
        assert.ok(response.body.description_ia)
        assert.ok(response.body.category_ia)

        console.log(
          'IA =>',
          response.body.description_ia,
          response.body.category_ia,
        )
        console.log('IMAGE =>', response.body.image_url)
      },
    )
  },
)
