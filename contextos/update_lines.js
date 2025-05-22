import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import AdmZip from "adm-zip";
import ExcelJs from "exceljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ManageDirectory {
  constructor(directoryPath) {
    this.directoryPath = path.join(__dirname, directoryPath);
  }

  async removeDirectory() {
    try {
      if (fs.existsSync(this.directoryPath)) {
        fs.rmSync(this.directoryPath, { recursive: true, force: true });
        return `Directory ${this.directoryPath}\n was remove...`;
      }
      return `Directory ${this.directoryPath}\n is not exist...`;
    } catch (error) {
      console.log("Error removeDirectory...", error.message);
      throw error;
    }
  }

  async addDirectory() {
    try {
      if (!fs.mkdirSync(this.directoryPath)) {
        fs.mkdirSync(this.directoryPath, { recursive: true });
        console.log(`Directory ${this.directoryPath}\n was created...`);
      }
      return `Directory ${this.directoryPath}\n is exist...`;
    } catch (error) {
      console.log("Error addDirectory...", error.message);
      throw error;
    }
  }

  getDirectory() {
    if (fs.existsSync(this.directoryPath)) {
      return this.directoryPath;
    }
    return `Directory is not exist...`;
  }
}

class MobileLines {
  constructor(url, directoryPath) {
    this.url = url;
    this.directoryPath = directoryPath;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.dateReport = null;
    this.pathZip = null;
  }

  async initialize() {
    try {
      this.browser = await chromium.launch({ headless: false });
      this.context = await this.browser.newContext({
        acceptDownloads: true,
        downloadsPath: this.directoryPath,
      });
      this.page = await this.context.newPage();
      await this.page.goto(this.url);
      console.log(`Url is up...`);
    } catch (error) {
      console.error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  async login(username, password) {
    await this.page.fill("#mat-input-5", username);
    await this.page.click('//*[@id="onetrust-accept-btn-handler"]');
    await this.page.click(
      '//*[@id="mainSection"]/div/paut-login/div/form[1]/div/div/paut-auth/div/div/div/div/div[2]/div[1]/button[1]/span/paut-loading-spinner/div/div'
    );
    await this.page.fill('//*[@id="mat-input-6"]', password);
    await this.page.click(
      '//*[@id="mainSection"]/div/paut-login/div/form[1]/div/div/paut-auth/div/div/div/div/div[2]/div/button/span/paut-loading-spinner/div/div'
    );
  }

  async createReport() {
    await this.page.click('//*[@id="boxCorporativo"]/span[1]');
    await this.page.click(
      '//*[@id="mat-tab-content-1-0"]/div/div/div/div[1]/paut-left-column/div/div[1]/span[1]/span'
    );
    await this.page.click('//*[@id="mat-select-3"]/div/div[1]/span');
    await this.page.click('//*[@id="mat-option-4"]/span');
    await this.page.click(
      '//*[@id="table"]/div/div/paut-table/section/div/div/div[1]/div[2]/div/div[2]/button[2]'
    );
    await this.page.click('//*[@id="mat-radio-3"]/label/div[2]');
    await this.page.click(
      '//*[@id="popupGenericoPrincipal"]/div/div[2]/footer/div/div/div/button[1]'
    );
    await this.page.waitForTimeout(1000);
    await this.page.reload();
  }

  async getReportToFolder() {
    // visit perfil/Mis descargas
    await this.page
      .locator('//button[@class="c-header__icon__button"]')
      .click();
    await this.page.locator('//a[contains(text(), "Mis descargas")]').click();

    // wait to report is available
    const initialWait = 5 * 60 * 1000; // 5 minutes in milliseconds
    const pollingInterval = 2 * 60 * 1000; // 2 minutes in milliseconds
    const maxAttempts = 4; // Maximum number of attempts

    console.log(
      `Waiting initial ${initialWait / 60000} minutes for report generation...`
    );
    await this.page.waitForTimeout(initialWait);

    // Polling logic
    let attempt = 1;
    let isAvailable = await this.reportIsAvailability();

    while (!isAvailable && attempt < maxAttempts) {
      console.log(
        `Report not available yet. Attempt ${attempt} of ${maxAttempts}`
      );
      console.log(
        `Waiting ${
          pollingInterval / 60000
        } more minutes before checking again...`
      );

      await this.page.waitForTimeout(pollingInterval);
      attempt++;
      isAvailable = await this.reportIsAvailability();
    }

    if (isAvailable) {
      const downloadPromise = this.page.waitForEvent("download");
      await this.page.hover(
        '//*[@id="mainSection"]/div/paut-mis-descargas/section/paut-table/section/div/div/div[2]/mat-table/mat-row[1]'
      );
      await this.page.waitForTimeout(500);
      await this.page.click(
        '//*[@id="mainSection"]/div/paut-mis-descargas/section/paut-table/section/div/div/div[2]/mat-table/mat-row[1]/mat-cell[5]/button'
      );

      const download = await downloadPromise;
      const filePath = await download.path();
      console.log(`Download completed: ${filePath}`);

      // save file.zip in folder
      const suggestedFilename = download.suggestedFilename();
      this.pathZip = path.join(this.directoryPath, suggestedFilename);
      await download.saveAs(this.pathZip);
      console.log(`File saved to: ${this.pathZip}`);
    }
    await this.context.close();
    await this.browser.close();
  }

  async reportIsAvailability() {
    await this.page.reload();
    await this.page.waitForTimeout(500);
    const isDisponible = await this.page
      .locator('//*[@id="mainSection"]//mat-row[1]/mat-cell[1]//span')
      .textContent();

    this.dateReport = await this.page
      .locator('//*[@id="mainSection"]//mat-row[1]/mat-cell[2]/span')
      .textContent();
    console.log(`Status check: ${isDisponible}, Date: ${this.dateReport}`);

    return isDisponible?.trim() === "Disponible";
  }

  getPathZip() {
    return this.pathZip;
  }

  getDateReport() {
    return this.dateReport;
  }
}

class ManageZipFile {
  constructor(pathZip, directoryPath) {
    this.pathZip = pathZip;
    this.directoryPath = directoryPath;
  }

  extractExcelZip() {
    try {
      if (fs.existsSync(this.pathZip)) {
        const zip = new AdmZip(this.pathZip);
        zip.extractAllTo(this.directoryPath, true); // true = overwrite existing

        const zipEntries = zip.getEntries();
        const excelEntry = zipEntries.find(
          (entry) =>
            entry.entryName.endsWith(".xlsx") ||
            entry.entryName.endsWith(".xls")
        );

        if (!excelEntry) {
          throw new Error("No Excel file found in the ZIP archive");
        }
        const excelBuffer = zip.readFile(excelEntry);
        return excelBuffer;
      }
    } catch (error) {
      console.log("Error in ManageExcelFile, extractZip...");
      throw error;
    }
  }
}

class ManageExcel {
  constructor(fileExcel) {
    this.fileExcel = fileExcel;
  }

  async readExcel() {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.load(this.fileExcel);
    const worksheet = workbook.worksheets[0];

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      const rowData = {
        telefono: row.values[2],
        extension: row.values[3],
        perfil: row.values[4],
        estado: row.values[6],
        icc: row.values[7],
        puk: row.values[8],
        nivel: row.values[12],
      };
      rows.push(rowData);
    });
    console.log(
      "Time and Date: ",
      new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
    );
    console.log(`Processed ${rows.length} rows from Excel file`);
    // console.log("data", rows);
    return rows;
  }
}

const setDirectory = async () => {
  const name = "download";
  const create = new ManageDirectory(name);
  const rm = await create.removeDirectory(name);
  const add = await create.addDirectory(name);
  console.log("rm", rm);
  console.log("add", add);

  const dir = create.getDirectory();
  const url = "https://paut.telefonica.es/login";
  const username = "JuanJose.Romero@emtmadrid.es";
  const password = "8492-Dmr_1712";
  const mobileLines = new MobileLines(url, dir);
  await mobileLines.initialize();
  await mobileLines.login(username, password);
  await mobileLines.createReport();
  await mobileLines.getReportToFolder();

  const dateReport = mobileLines.getDateReport();
  console.log("DateReport", dateReport);

  const pathzip = mobileLines.getPathZip();
  const zip = new ManageZipFile(pathzip, dir);
  const excel = zip.extractExcelZip();

  const readExcel = new ManageExcel(excel);
  const excelData = await readExcel.readExcel();
  console.log(`Extracted ${excelData.length} records`);
};

setDirectory();
