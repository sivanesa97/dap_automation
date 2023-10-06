import XLSX from 'sheetjs-style'
import { set_cptable } from 'xlsx'
import { cptable } from 'xlsx/dist/cpexcel.full.mjs'

export const exportToXLSX = (data, headers, filename, sheetName, columnWidths, type) => {
  set_cptable(cptable)
  var curdate = new Date()

  var exportFileName =
    filename +
    '_' +
    curdate.getFullYear() +
    '_' +
    curdate.getMonth() +
    '_' +
    curdate.getDate() +
    '_' +
    curdate.getHours() +
    '_' +
    curdate.getMinutes() +
    '.xlsx'

  const mappedData = data.map(item => {
    const mappedRow = {}
    if (type === 1) {
      Object.keys(headers).forEach(key => {
        if (key == 'verificationStatus' && item[key] == 1 && item['additionalStatus'] == 0) {
          mappedRow[headers[key]] = 'Matched'
        } else if (key == 'verificationStatus' && item[key] == 1 && item['additionalStatus'] == 1) {
          mappedRow[headers[key]] = 'Matched from Red List'
        } else if (key == 'verificationStatus' && item[key] == 0) {
          mappedRow[headers[key]] = 'Not Matched'
        } else if (key == 'newDataCheckStatus' && item[key] == 2) {
          mappedRow[headers[key]] = 'New Data Matched'
        } else if (key == 'newDataCheckStatus' && item[key] == 1) {
          mappedRow[headers[key]] = 'New Data Not Matched'
        } else {
          mappedRow[headers[key]] = item[key] || ''
        }
        if (key == 'existingStatus' && item[key] == 1) {
          mappedRow[headers[key]] = 'Yes'
        } else if (key == 'existingStatus' && item[key] == 0) {
          mappedRow[headers[key]] = 'No'
        }
      })
    } else if (type === 2) {
      Object.keys(headers).forEach(key => {
        if (key == 'metricStatus' && item[key] == 1) {
          mappedRow[headers[key]] = 'Fetched'
        } else if (key == 'metricStatus' && item[key] == 0 && item['retryCount'] == 0) {
          mappedRow[headers[key]] = 'Yet to Fetch'
        } else if (key == 'metricStatus' && item[key] == 0 && item['retryCount'] == 4) {
          mappedRow[headers[key]] = 'Unable To Fetch'
        } else if (key == 'metricStatus' && item[key] == 0 && item['retryCount'] < 4 && item['retryCount'] > 0) {
          mappedRow[headers[key]] = 'Fetching'
        } else {
          mappedRow[headers[key]] = item[key] || ''
        }
        if (key == 'existingStatus' && item[key] == 1) {
          mappedRow[headers[key]] = 'Yes'
        } else if (key == 'existingStatus' && item[key] == 0) {
          mappedRow[headers[key]] = 'No'
        }
      })
    } else if (type == 3) {
      Object.keys(headers).forEach(key => {
        if (key == 'checkStatus' && item[key] == 1) {
          mappedRow[headers[key]] = 'Processed'
        } else if (key == 'checkStatus' && item[key] == 0) {
          mappedRow[headers[key]] = 'Pending'
        } else if (key == 'status' && item[key] == 0) {
          mappedRow[headers[key]] = 'Not Matched'
        } else if (key == 'status' && item[key] == 1) {
          mappedRow[headers[key]] = 'Matched'
        } else {
          mappedRow[headers[key]] = item[key] || ''
        }
      })
    }

    return mappedRow
  })

  const twipsColumnWidths = columnWidths.map(width => width * 20)
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(mappedData, { cellStyles: true })
  worksheet['!cols'] = twipsColumnWidths.map(width => ({ width }))

  const headerStyle = {
    font: {
      color: { rgb: 'FF003333' },
      bold: true
    },
    alignment: {
      horizontal: 'left'
    }
  }

  Object.keys(headers).forEach((key, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: index })
    worksheet[cellRef]["s"] = headerStyle
  })
  data.map((item, ind) => {
    var status = 0
    if (type === 1) {
      if (
        item['verificationStatus'] == 1 &&
        item['additionalStatus'] == 0 &&
        (item['newDataCheckStatus'] == 0 || item['newDataCheckStatus'] == 2)
      ) {
        status = 2
      } else if (
        item['verificationStatus'] == 1 &&
        (item['newDataCheckStatus'] == 1 || item['additionalStatus'] == 1)
      ) {
        status = 1
      } else if (item['verificationStatus'] == 0 && item['newDataCheckStatus'] == 2) {
        status = 1
      }
    } else if (type === 2) {
      if (item['metricStatus'] == 1) {
        status = 1
      }
    } else if (type == 3) {
      if (item['status'] == 1) {
        status = 1
      } else if (item['status'] == 0 && item['checkStatus'] == 0) {
        status = 2
      }
    }
    if (type == 2) {
      Object.keys(headers).forEach((key, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: ind + 1, c: index })
        if (status == 1 && headers[key] == 'Fetch Status') {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FF0EFEA3' } }
          }
        } else if (status != 1 && headers[key] == 'Fetch Status') {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FFFF7456' } }
          }
        }
      })
    } else if (type == 1) {
      Object.keys(headers).forEach((key, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: ind + 1, c: index })
        if (status == 1 && (headers[key] == 'DAP Value' || headers[key] == 'Match Status')) {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FFFFFF00' } }
          }
        } else if (status == 2 && (headers[key] == 'DAP Value' || headers[key] == 'Match Status')) {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FF0EFEA3' } }
          }
        } else if (headers[key] == 'DAP Value' || headers[key] == 'Match Status') {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FFFF7456' } }
          }
        }
      })
    } else if (type == 3) {
      Object.keys(headers).forEach((key, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: ind + 1, c: index })
        if (status == 1 && (headers[key] == 'DAP Value' || headers[key] == 'Status')) {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FF0EFEA3' } }
          }
        } else if (status == 2 && (headers[key] == 'DAP Value' || headers[key] == 'Status')) {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FFFFFF00' } }
          }
        } else if (headers[key] == 'DAP Value' || headers[key] == 'Status') {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: 'FFFF7456' } }
          }
        }
      })
    }
  })

  console.log(worksheet)

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true })

  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, exportFileName)
  } else {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }
}
