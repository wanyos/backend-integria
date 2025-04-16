import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import morgan from 'morgan'
import { fileURLToPath } from 'url'
import usersRouter from './routers/usersRoutes.js'
import incidentsRouter from './routers/incidentsRoutes.js'
import inventoryRouter from './routers/inventoryRoutes.js'
import reportRouter from './routers/reportRoutes.js'
import loginRouter from './routers/loginRoutes.js'
import { globalMiddleware, authMiddleware } from './middelware.js'
import { sendGmail } from './email-config/gmail-config.js'
import { json2csv } from 'json-2-csv'
import { convertJsonToExcel } from './email-config/conver_excel.js'

const app = express()
app.disable('x-powered-by')

// Setting to get the current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Dynamically build the path to the .env.development file
const envFile = `.env.${process.env.NODE_ENV || 'development'}`
const envPath = path.resolve(__dirname, envFile)
dotenv.config({ path: envPath })
const PORT = process.env.PORT || 8021

const corsOption = {
  origin: [
    'http://localhost:8022',
    `http://127.0.0.1:8022`,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://10.10.14.37:5173',
    'http://10.10.14.37:8080',
    'http://10.10.14.37',
    'http://10.10.14.137:5173',
    'http://10.10.14.137',
    'http://192.168.1.133:8080',
    'http://192.168.1.133',
    'http://10.9.14.80:8080',
    'http://10.9.14.80',
  ],
  method: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200,
}

if (process.env.NODE_ENV === 'test') {
  app.use(cors())
} else {
  app.use(cors(corsOption))
}

app.use(express.json())
app.use(morgan('dev'))

//login
app.use('/api', loginRouter)

// routes
app.use('/api/report', reportRouter)
app.use('/api/users', authMiddleware, usersRouter)
app.use('/api/incidents', authMiddleware, incidentsRouter)
app.use('/api/inventory', authMiddleware, inventoryRouter)

app.post('/send-gmail', async (req, res) => {
  const { email, title, comment, incidents } = req.body
  if (!incidents) {
    return res.status(400).send('No incidents data provided.')
  }

  // const csv = await json2csv(incidents);
  const excel = await convertJsonToExcel(incidents)

  const options = {
    to: email,
    subject: title,
    text: comment,
    fileName: 'export.xlsx',
    fileData: excel,
  }

  try {
    const result = await sendGmail(options)
    res.status(200).json(result)
  } catch (error) {
    console.error('Error en /send-email:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.use(globalMiddleware)

let server
function startServer(port) {
  let actualPort = ''
  try {
    server = app.listen(port, async () => {
      actualPort = server.address().port
      console.log(`Server listening on port ${actualPort}`)
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Trying another port...`)
        // startServer(0);
      } else {
        console.error('Server error: ', err)
      }
    })
  } catch (err) {
    console.error('Error starting server: ', err)
  }
}

export const stopProcess = (signal) => {
  console.log(`\nReceived ${signal}. Closing server...`)
  if (server) {
    server.close((err) => {
      if (err) {
        console.error('Error closing server:', err)
      } else {
        console.log('Server closed successfully.')
      }
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
}

process.on('SIGTERM', stopProcess)
process.on('SIGINT', stopProcess)
process.on('uncaughtException', stopProcess)
process.on('unhandledRejection', stopProcess)
process.on('exit', (code) => {
  console.log(`Process exited with code: ${code}`)
})

startServer(PORT)
