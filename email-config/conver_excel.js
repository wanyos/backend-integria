import ExcelJS from 'exceljs'

export const convertJsonToExcel = async (jsonData) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet 1')

  const headers = Object.keys(jsonData[0])
  worksheet.columns = headers.map((header) => ({ header, key: header }))

  jsonData.forEach((data) => {
    worksheet.addRow(data)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  console.log('Excel file created successfully as Buffer')
  return buffer
}

// // Ejemplo de uso
// const exampleJson = [
//   { id: 1, name: 'John Doe', age: 30 },
//   { id: 2, name: 'Jane Doe', age: 25 },
// ];

// convertJsonToExcel(exampleJson).then(buffer => {
//   // Aquí puedes usar el buffer para enviar el archivo por correo
//   console.log('Buffer length:', buffer.length);
// });

export const readExcelFile = async (filePath) => {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)

  const worksheet = workbook.getWorksheet(1)
  const jsonData = []

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return
    }

    const rowData = {}
    row.eachCell((cell, colNumber) => {
      const header = worksheet.getRow(1).getCell(colNumber).value
      rowData[header] = cell.value
    })

    jsonData.push(rowData)
  })

  console.log('Excel file read successfully:', jsonData)
  return jsonData
}

// Ejemplo de uso
// const filePath = './servidesk.xlsx';
// readExcelFile(filePath).then(data => {
//   console.log('Data from Excel file:', data);
// });
