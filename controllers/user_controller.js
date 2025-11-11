import { Router } from "express"; //IMPORTAMOS ROUTER DE EXPRESS
import Product from "../models/product.js"; // IMPORTO EL MODELO DEL PRODUCTO
import User from "../models/user.js"; //USER MODEL
import info from "./utils/logger.js";
import bcrypt from "bcrypt";

const userRouter = Router(); // CREAMOS  EL OBJETO ROUTER

//-------- METODOS -----------------------------------------

/**
 *! GET ALL USUARIOS: Ruta para obtener todos los usuarios
 */
userRouter.get("/", async (request, response) => {
  // Busca todos los documentos de la colección 'User'.
  // .populate('Product', { userName: 1, name: 1 }) es crucial: reemplaza el ObjectId del campo 'user'
  // con los datos reales del usuario (solo userName y name), facilitando la lectura en el frontend.
  const products = await Product.find({}).populate("Product", {
    name: 1,
  });
  // Envía la lista completa de productos como respuesta JSON.
  response.status(200).json(products);
});

/**
 *! POST NEW USER: Ruta para crear un nuevo USUARIO
 */
userRouter.post("/", async (request, response) => {
  const { userName, name, password } = request.body;
  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: "The min length of password is 3 characters" });
  }

  const saltRounds = 10;
  const passwordHass = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    name,
    userName,
    passwordHass,
  });
  const userSaved = await newUser.save();
  response.status(201).json(userSaved);
});

/**
 *! GET USER
 */
userRouter.get("/:id", async (request, response) => {
  const id = request.params.id;
  const user = await User.findById(id);
  if (user) {
    response.json(user);
  } else {
    response.status(400).end();
  }
});

/**
 *! DELETED USER
 */
userRouter.delete("/:id", async (request, response) => {
  const id = request.params.id;
  try {
    await User.findByIdAndDelete(id);
    response.status(204).end();
  } catch (error) {
    info("error connecting to MongoDB:", error.message);
  }
});
/**
 *!   MODIFICATE USER
 */

userRouter.patch("/:id", async (request, response) => {
  const id = request.params.id;
  const body = request.body;
  try {
    const updateUser = await User.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updateUser) {
      return response.status(404).json({ error: "User not found" });
    }
    response.status(204).end();
  } catch (error) {
    info(error.message);
  }
});
