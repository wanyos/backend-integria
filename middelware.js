import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./util/errors";

export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    const customError = new UnauthorizedError(
      "Error auth validate login: authMiddleware()",
      error
    );
    res.status(customError.status).json({
      errorName: customError.name,
      message: customError.message,
      timestamp: customError.timestamp,
      originalError: customError.originalError,
    });
  }
};

export const globalMiddleware = (err, req, res) => {
  console.error("Error caught on server:", err);

  res.status(err.status || 500).json({
    error: err.name,
    message: err.message,
    timestamp: err.timestamp,
    originalError: err.originalError,
  });
};
