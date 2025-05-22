import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";
import usersRouter from "./routers/usersRoutes.js";
import incidentsRouter from "./routers/incidentsRoutes.js";
import inventoryRouter from "./routers/inventoryRoutes.js";
import reportRouter from "./routers/reportRoutes.js";
import loginRouter from "./routers/loginRoutes.js";
import { globalMiddleware, authMiddleware } from "./middelware.js";
import { sendGmail } from "./email-config/gmail-config.js";
import { convertJsonToExcel } from "./email-config/conver_excel.js";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "node:fs";

const app = express();
app.disable("x-powered-by");
const execFileAsync = promisify(execFile);

// Setting to get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically build the path to the .env.development file
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
const envPath = path.resolve(__dirname, envFile);
dotenv.config({ path: envPath });
const PORT = process.env.PORT || 8021;

const corsOption = {
  origin: [
    "http://localhost:8022",
    `http://127.0.0.1:8022`,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://10.10.14.37:5173",
    "http://10.10.14.37:8080",
    "http://10.10.14.37",
    "http://10.10.14.137:5173",
    "http://10.10.14.137",
    "http://192.168.1.133:8080",
    "http://192.168.1.133",
    "http://10.9.14.80:8080",
    "http://10.9.14.80",
  ],
  method: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
};

if (process.env.NODE_ENV === "test") {
  app.use(cors());
} else {
  app.use(cors(corsOption));
}

app.use(express.json());
app.use(morgan("dev"));

// login
app.use("/api", loginRouter);

// routes
app.use("/api/report", reportRouter);
app.use("/api/users", authMiddleware, usersRouter);
app.use("/api/incidents", authMiddleware, incidentsRouter);
app.use("/api/inventory", authMiddleware, inventoryRouter);

app.post("/send-outlook", async (req, res) => {
  const { email, cc, cco, title, comment, incidents } = req.body;

  if (!incidents) {
    return res.status(400).send("No incidents data provided.");
  }

  try {
    const excel = await convertJsonToExcel(incidents);
    const fileName = "incidencias.xlsx";

    // Ruta al script y carpeta temporal
    const scriptPath = path.join(__dirname, "email-config", "cau_email.ps1");
    const tempDir = path.join(__dirname, "email-config", "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, excel);

    const to = email.split(",").join(";");
    const ccFormatted = cc.split(",").join(";");
    const bcc = cco.split(",").join(";");

    // Construir argumentos para PowerShell
    const args = [
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
      "-To",
      to,
      "-Cc",
      ccFormatted || "",
      "-Bcc",
      bcc || "cau@emtmadrid.es",
      "-Asunto",
      title || "Informe automático",
      "-Cuerpo",
      comment || "Adjuntamos el informe semanal.",
      "-Adjunto",
      filePath,
    ];

    // Ejecutar script PowerShell
    const { stdout, stderr } = await execFileAsync("powershell.exe", args);

    // Borrar el archivo temporal
    fs.unlinkSync(filePath);

    if (stderr) {
      console.error("❌ PowerShell stderr:", stderr);
    }

    const result = {
      success: true,
      message: "Email enviado correctamente",
      to: to,
      cc: cc,
      bcc: bcc,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error al enviar correo con Outlook:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// app.post("/send-gmail", async (req, res) => {
//   const { email, cc, cco, title, comment, incidents } = req.body;
//   if (!incidents) {
//     return res.status(400).send("No incidents data provided.");
//   }

//   const excel = await convertJsonToExcel(incidents);

//   const options = {
//     to: email,
//     cc: cc,
//     bcc: cco,
//     subject: title,
//     text: comment,
//     fileName: "export.xlsx",
//     fileData: excel,
//   };

//   try {
//     const result = await sendGmail(options);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error en /send-email:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

app.use(globalMiddleware);

let server;
function startServer(port) {
  let actualPort = "";
  try {
    server = app.listen(port, async () => {
      actualPort = server.address().port;
      console.log(`Server listening on port ${actualPort}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Trying another port...`);
        // startServer(0);
      } else {
        console.error("Server error: ", err);
      }
    });
  } catch (err) {
    console.error("Error starting server: ", err);
  }
}

export const stopProcess = (signal) => {
  console.log(`\nReceived ${signal}. Closing server...`);
  if (server) {
    server.close((err) => {
      if (err) {
        console.error("Error closing server:", err);
      } else {
        console.log("Server closed successfully.");
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", stopProcess);
process.on("SIGINT", stopProcess);
process.on("uncaughtException", stopProcess);
process.on("unhandledRejection", stopProcess);
process.on("exit", (code) => {
  console.log(`Process exited with code: ${code}`);
});

startServer(PORT);
