import { test, after, beforeEach, describe } from 'node:test'
import supertest from 'supertest'
import mongoose from 'mongoose'
import assert from 'assert'
import app from '../app.js'
import Product from '../models/product.js'
import User from '../models/user.js'
import { initialProducts } from './test_helper.js'
import info from '../utils/logger.js'
import bcrypt from 'bcrypt'

const api = supertest(app)
let tokenUser = null

describe('Api product test, return json,create deleted...', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHass = await bcrypt.hash('1234', 10)
    await User.create({
      userName: 'inventario',
      name: 'kevin rojas',
      passwordHass: passwordHass,
    })
    const users = await User.find({})

    await Product.deleteMany({})

    await Product.insertMany(initialProducts(users[0].id))

    const userData = {
      userName: 'inventario',
      password: '1234',
    }
    const loginUser = await api.post('/api/login').send(userData).expect(200)

    tokenUser = `Bearer ${loginUser.body.token}`
    info('TOKEN:', tokenUser)
  })

  test('Products has in the database', async () => {
    const response = await api.get('/api/products')
    assert.strictEqual(response.body.data.length, 10)
  })

  test('Created product and save in db', async () => {
    const newProduct = {
      name: 'Iphone 16',
      price: 32.45,
      stock: 100,
      serial_number: 'ASW132WDA',
    }

    const response = await api
      .post('/api/products')
      .set('Authorization', tokenUser)
      .send(newProduct)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const newsProducts = await api.get('/api/products')
    info(newsProducts.body)
    const newLength = newsProducts.body.meta.totalItems

    assert.strictEqual(newLength, 13)
    assert.strictEqual(response.body.name, newProduct.name)
    assert.strictEqual(response.body.price, newProduct.price)
    assert.strictEqual(response.body.stock, newProduct.stock)
    assert.ok(response.body.id)
  })

  test('Geter product for ID', async () => {
    const allProductsResponse = await api.get('/api/products')
    const productId = allProductsResponse.body.data[0].id
    const response = await api
      .get(`/api/products/${productId}`)
      .set('Authorization', tokenUser)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(
      response.body.name,
      allProductsResponse.body.data[0].name,
    )
    assert.strictEqual(
      response.body.price,
      allProductsResponse.body.data[0].price,
    )
  })

  test('Delet product', async () => {
    const allProductsResponse = await api.get('/api/products')
    const productId = allProductsResponse.body.data[0].id
    const response = await api
      .delete(`/api/products/${productId}`)
      .set('Authorization', tokenUser)
      .expect(204)
  })

  test(' It does not allow creating a product with negative stock.', async () => {
    const res = await api
      .post('/api/products')
      .set('Authorization', tokenUser)
      .send({
        name: 'Producto inválido',
        price: 10,
        stock: -5,
        serial_number: 'BAD777',
      })
      .expect(400)
  })

  test('Returns paginated products', async () => {
    const res = await api
      .get('/api/products?page=1&limit=2')
      .set('Authorization', tokenUser)
      .expect(200)

    assert.strictEqual(res.body.data.length, 2)
    assert.ok(res.body.meta.totalItems >= 5)
    assert.ok(res.body.meta.totalPages >= 3)
  })

  test('Filter by text using search', async () => {
    const res = await api
      .get('/api/products?search=monitor')
      .set('Authorization', tokenUser)
      .expect(200)

    assert.ok(res.body.data.length >= 1)

    for (const p of res.body.data) {
      assert.ok(
        p.name.toLowerCase().includes('monitor') ||
          (p.category_ia && p.category_ia.toLowerCase().includes('monitor')) ||
          (p.description_ia &&
            p.description_ia.toLowerCase().includes('monitor')),
      )
    }
  })

  test('Filter by minimum and maximum stock', async () => {
    const res = await api
      .get('/api/products?stockMin=10&stockMax=30')
      .set('Authorization', tokenUser)
      .expect(200)

    for (const product of res.body.data) {
      assert.ok(product.stock >= 10 && product.stock <= 30)
    }
  })
  test('Page 2 returns different products than page 1', async () => {
    const res1 = await api
      .get('/api/products?page=1&limit=2')
      .set('Authorization', tokenUser)

    const res2 = await api
      .get('/api/products?page=2&limit=2')
      .set('Authorization', tokenUser)

    const ids1 = res1.body.data.map((p) => p.id)
    const ids2 = res2.body.data.map((p) => p.id)

    assert.ok(!ids1.includes(ids2[0]))
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
