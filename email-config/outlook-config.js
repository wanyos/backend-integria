import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = `../.env.${process.env.NODE_ENV || "development"}`;
const envPath = path.resolve(__dirname, envFile);
dotenv.config({ path: envPath });

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    type: "OAuth2",
    user: process.env.OUTLOOK_EMAIL_USER,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    tenantId: process.env.AZURE_TENANT_ID,
  },
});

export const sendOutlook = async (options) => {
  try {
    const gm = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options?.text,
      html: options?.html,
      attachments: [
        {
          filename: options?.fileName,
          content: options?.fileData,
        },
      ],
    });
    return {
      success: true,
      message: "Email enviado correctamente",
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      messageId: gm.messageId,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error sending email",
      error: error.message,
    };
  }
};
