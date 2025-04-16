import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY)
    req.user = decoded
    next()
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' })
  }
}

export const globalMiddleware = (err, req, res) => {
  console.error(err.stack)

  const errorResponse = {
    status: err.status || 500,
    message: err.message || 'Internal server error',
  }

  if (err.name === 'ValidationError') {
    errorResponse.status = 400
    errorResponse.message = err.message
  }

  if (err.name === 'UnauthorizedError') {
    errorResponse.status = 401
    errorResponse.message = err.message
  }

  res.status(errorResponse.status).json(errorResponse)
}
