import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import * as XLSX from 'xlsx/xlsx.mjs'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { FileUploadOutlined } from '@mui/icons-material'
import axios from 'axios'
import moment from 'moment'
import ExcelJS from 'exceljs'

const UploadExcel = ({ open, handleDialogToggle, setOpen, categories }) => {
  const router = useRouter()
  const fileRef = useRef()
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL
  const auth = useAuth()
  const [error, setError] = useState(true)

  const [count, setCount] = useState({
    workable: 0,
    nonWorkable: 0
  })
  var curdate = new Date()
  const [fileName, setFileName] = useState(null)
  const [showPreviewPage, setShowPreviewPage] = useState(false)
  const [header, setHeader] = useState([])
  const [excelData, setExcelData] = useState([])
  const [state, setState] = useState([])
  const [date, setDate] = useState(moment(curdate).format().slice(0, 10))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadState()
  }, [])

  const loadState = () => {}

  const cleanAndLowercase = value => {
    if (typeof value === 'string') {
      return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    }

    return value
  }

  const handleChange = e => {
    if (e.target.type === 'file' && e.target.files != null && e.target.files.length > 0) {
      setShowPreviewPage(false)
      setIsLoading(true)
      var file = e.target.files[0]
      setFileName(file.name)

      var reader = new FileReader()

      const rowTemplate = {
        dapCode: '',
        category: '',
        sku: '',
        attributeName: '',
        dapValue: '',
        filterStatus: 0,
        cellBackgroundColor: '',
        checkStatus: 0,
        isActive: 1,
        comments: '',
        status: 0
      }

      reader.onload = async function (evt) {
        var data = evt.target.result
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(data)

        const worksheet = workbook.getWorksheet(1)
        var totalWorkableCount = 0
        var set = new Set()
        var totalNonWorkableCount = 0
        var totalCount = 0
        var countryColumn = -1
        var categoryColumn = -1
        var skuColumn = -1
        var attributeNameColumn = -1
        var dapValueColumn = -1
        var finalData = []
        worksheet.eachRow((row, rowIndex) => {
          if (rowIndex === 1) {
            row.eachCell((cell, cellIndex) => {
              var f = cell.text
              if (cleanAndLowercase(f) == 'country') {
                countryColumn = cellIndex
              } else if (cleanAndLowercase(f) == 'category') {
                categoryColumn = cellIndex
              } else if (cleanAndLowercase(f) == 'part') {
                skuColumn = cellIndex
              } else if (cleanAndLowercase(f) == 'attributename') {
                attributeNameColumn = cellIndex
              } else if (cleanAndLowercase(f) == 'dapvalue') {
                dapValueColumn = cellIndex
              }
            })

            return
          } else if (rowIndex > 1) {
            var rowData = { ...rowTemplate }
            if (countryColumn > 0) {
              rowData.dapCode = row.getCell(countryColumn).value
            }
            if (categoryColumn > 0) {
              rowData.category = row.getCell(categoryColumn).value
            }
            if (attributeNameColumn > 0) {
              rowData.attributeName = row.getCell(attributeNameColumn).value
            }
            if (skuColumn > 0) {
              rowData.sku = row.getCell(skuColumn).value
            }
            if (dapValueColumn > 0) {
              rowData.dapValue = row.getCell(dapValueColumn).value
              const cellBackgroundColor = row.getCell(dapValueColumn).style.fill.fgColor.argb
              if (cellBackgroundColor != null) {
                set.add(cellBackgroundColor)
                rowData.cellBackgroundColor = cellBackgroundColor
                if (cellBackgroundColor.toUpperCase() == 'FFFFEA3C') {
                  rowData.filterStatus = 1
                  totalWorkableCount++
                  finalData.push(rowData)
                }
              }
            }
            totalCount++
          }
        })
        totalNonWorkableCount = totalCount - totalWorkableCount
        setCount({ nonWorkable: totalNonWorkableCount, workable: totalWorkableCount })
        console.log(finalData)
        finalData.sort((a, b) => b.filterStatus - a.filterStatus)
        setExcelData(finalData)
        console.log(set)
        setIsLoading(false)
      }
      reader.readAsBinaryString(file)
    }
  }

  const handleUploadClick = () => {
    fileRef.current.click()
  }

  const handleClose = () => {
    setFileName(null)
    fileRef.current.value = ''
    setShowPreviewPage(false)
    setExcelData(null)
    setState([])
    setOpen(!open)
  }

  const handlePreview = () => {
    if (fileName != null) {
      setShowPreviewPage(true)
    } else {
      alert('please upload correct file')
    }
  }

  const handleUpload = () => {
    var postData = excelData
    postData = postData.filter(e => {
      return e.filterStatus == 1
    })
    for (var i = 0; i < postData.length; i++) {
      postData[i].date = date
    }
    axios.post(AUTH_URL + 'newDataCheckUpload?username=' + auth.user.username, postData).then(res => {
      if (res.data && res.status == 200 && res.data.length > 0) {
        toast.success('Input Uploaded successfully')
        handleDialogToggle()
        console.log(res.data)
      } else {
        toast.error('Failed!')
      }
    })
  }

  return (
    <Grid>
      <Dialog
        open={open}
        onClose={handleDialogToggle}
        maxWidth={showPreviewPage && excelData && excelData.length > 0 ? 'lg' : 'sm'}
        fullWidth
      >
        <DialogTitle>DAP Report File Upload</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ my: showPreviewPage && excelData && excelData.length > 0 ? '20px' : '50px', mx: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TextField
                  value={date}
                  style={{ height: '50px' }}
                  sx={{ marginRight: 5 }}
                  onChange={e => {
                    setDate(e.target.value)
                  }}
                  name='date'
                  type='date'
                />
                <label
                  htmlFor='file'
                  style={{ height: '50px', marginBottom: '0', display: 'flex', alignItems: 'center' }}
                >
                  <Button
                    sx={{ marginRight: 5 }}
                    color='primary'
                    variant='contained'
                    startIcon={<FileUploadOutlined />}
                    onClick={handleUploadClick}
                  >
                    Choose File
                  </Button>
                </label>
              </div>
              <input
                type='file'
                id='file'
                ref={fileRef}
                style={{ display: 'none' }}
                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                onChange={e => handleChange(e)}
              />
              <br />
              {fileName && (
                <label htmlFor='file'>
                  <b>File Name:</b> {fileName}
                </label>
              )}
            </Box>
          </Box>
          {showPreviewPage && (
            <TableContainer>
              <div style={{ textAlign: 'right' }}>
                <span>
                  <b>Workable: {count.workable}</b>
                </span>
                <br />
                <span>
                  <b>Non-Workable: {count.nonWorkable}</b>
                </span>
              </div>
              <Table>
                {excelData && excelData.length > 0 && (
                  <TableHead>
                    <TableRow style={{ fontWeight: 'bold' }}>
                      <TableCell>#</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>DAP Code</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Attribute Name</TableCell>
                      <TableCell>DAP Value</TableCell>
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {excelData &&
                    excelData.length > 0 &&
                    excelData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell key={index}>{index + 1}</TableCell>
                        <TableCell key={index}>{row.category || ''}</TableCell>
                        <TableCell key={index}>{row.dapCode || ''}</TableCell>
                        <TableCell key={index}>{row.sku || ''}</TableCell>
                        <TableCell key={index}>{row.attributeName || ''}</TableCell>
                        <TableCell key={index}>{row.dapValue || ''}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <center style={{ padding: '8px', margin: '5px' }}>
            {showPreviewPage ? (
              <Button size='large' variant='outlined' color='primary' onClick={handleUpload}>
                Submit
              </Button>
            ) : (
              <Button size='large' variant='outlined' color='primary' onClick={handlePreview}>
                Preview
              </Button>
            )}
            <Button
              size='large'
              sx={{ padding: 2, margin: 4 }}
              variant='outlined'
              color='secondary'
              onClick={handleClose}
            >
              Discard
            </Button>
          </center>
        </DialogContent>
        {isLoading && (
          <Backdrop
            sx={{
              color: '#fff',
              zIndex: theme => theme.zIndex.drawer + 1
            }}
            open={isLoading}
          >
            <CircularProgress color='inherit' />
          </Backdrop>
        )}
      </Dialog>
    </Grid>
  )
}

export default UploadExcel
