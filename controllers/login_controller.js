import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { Router } from "express";

const loginRouter = Router();

// POST
// request para iniciar sesión (Ruta: /api/login)
loginRouter.post("/", async (request, response) => {
  // Desestructura 'userName' y 'password' del cuerpo de la petición.
  const { userName, password } = request.body;

  // ----------------------------------------------------------------------
  // ----------------------------------------------------------------------

  // 1. Búsqueda del Usuario y Carga del Hash
  const user = await User.findOne({ userName }).select("+passWordHass");

  // ----------------------------------------------------------------------
  // 2. Comparación de Contraseña
  // ----------------------------------------------------------------------

  // Se usa un operador ternario para determinar si la contraseña es correcta:
  const passwordCorrect =
    user === null
      ? // Si 'user' es null (no se encontró), la contraseña es incorrecta (false).
        false
      : // Esta comparación solo debe ejecutarse si 'user' es un objeto válido.
        // Si 'user' NO es null (se encontró), se usa bcrypt para comparar la contraseña.
        await bcrypt.compare(password, user.passWordHass);

  // ----------------------------------------------------------------------
  // 3. Verificación de Autenticación (Fail Fast)
  // ----------------------------------------------------------------------

  // La condición de fallo: si NO se cumple (que el usuario exista Y la contraseña sea correcta).
  if (!(user && passwordCorrect)) {
    // Si falla, devuelve un código 401 Unauthorized y un mensaje de error genérico (seguridad).
    response.status(401).json({
      error: "invalid username or password",
    });
  }

  // ----------------------------------------------------------------------
  // 4. Generación y Envío del Token (Éxito)
  // ----------------------------------------------------------------------

  // Crea el payload de datos que se firmará en el token JWT.
  const userForToken = {
    username: user.userName,
    id: user._id,
  };

  // Firma los datos para crear el JSON Web Token (JWT).
  const token = jwt.sign(userForToken, process.env.SECRET);

  // Devuelve el código 200 OK junto con el token, username y name.
  response
    .status(200)
    .send({ token, username: user.userName, name: user.name });
});

export default loginRouter;
