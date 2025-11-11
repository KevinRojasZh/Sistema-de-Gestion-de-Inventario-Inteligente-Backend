import { test, after, beforeEach, describe } from "node:test";
import supertest from "supertest";
import mongoose from "mongoose";
import assert from "assert";
import app from "../app.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import { initialProduct } from "./test_helper.js";
import info from "../utils/logger.js";
import bcrypt from "bcrypt";

const api = supertest(app);
let tokenUser = null;

describe("Api product test, return json,create deleted...", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHass = await bcrypt.hash("1234", 10);
    await User.create({
      userName: "inventario",
      name: "kevin rojas",
      passWordHass: passwordHass,
    });
    const users = await User.find({});

    await Product.deleteMany({});

    await Product.insertOne(initialProduct(users[0].id));

    const userData = {
      userName: "inventario",
      password: "1234",
    };
    const loginUser = await api.post("/api/login").send(userData).expect(200);

    tokenUser = `Bearer ${loginUser.body.token}`;
    info("TOKEN:", tokenUser);
  });

  test("Product has in the database", async () => {
    const response = await api.get("/api/product");
    assert.strictEqual(response.body.length, 1);
    info(response.body);
  });

  test("Created product and save in db", async () => {
    const newProduct = {
      name: "Iphone 16",
      price: 32.45,
      stock: 100,
    };

    const response = await api
      .post("/api/product")
      .set("Authorization", tokenUser)
      .send(newProduct)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const newsProducts = await api.get("/api/product");
    const newLength = newsProducts.body.length;

    assert.strictEqual(newLength, 2);
    assert.strictEqual(response.body.name, newProduct.name);
    assert.strictEqual(response.body.price, newProduct.price);
    assert.strictEqual(response.body.stock, newProduct.stock);
    assert.ok(response.body.id);
  });

  test("Geter product for ID", async () => {
    const allProductsResponse = await api.get("/api/product");
    const productId = allProductsResponse.body[0].id;
    const response = await api
      .get(`/api/product/${productId}`)
      .set("Authorization", tokenUser)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.name, allProductsResponse.body[0].name);
    assert.strictEqual(response.body.price, allProductsResponse.body[0].price);
  });

  test("Delet product", async () => {
    const allProductsResponse = await api.get("/api/product");
    const productId = allProductsResponse.body[0].id;
    const response = await api
      .delete(`/api/product/${productId}`)
      .set("Authorization", tokenUser)
      .expect(204);
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
