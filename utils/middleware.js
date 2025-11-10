import info from "./logger";
import jwt from "jsonwebtoken";

const requestLogger = (request, response, next) => {
  info("Method:", request.method);
  info("Path:  ", request.path);
  info("Body:  ", request.body);
  info("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const tokenExtractor = (request, response, next) => {
  const token = request.get("Authorization");
  if (!token) {
    return response.status(401).json({ error: "Dont have TOKEN" });
  }
  if (token.startsWith("Bearer ")) {
    const cleanToken = token.replace("Bearer ", "");
    request.token = cleanToken;
  } else {
    return response.status(401).json({ error: "Token invalid" });
  }
  next();
};

const userExtract = (request, response, next) => {
  if (!request.token) {
    return next();
  }
  const decodeToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodeToken.id) {
    throw new Error("Token dont have Id");
  }
  const userId = decodeToken.id;
  request.user = userId;
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  info("HOLA");

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return response
      .status(400)
      .json({ error: "expected `username` to be unique" });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "token invalid" });
  }

  next(error);
};

export default {
  requestLogger,
  unknownEndpoint,
  tokenExtractor,
  userExtract,
  errorHandler,
};
