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
  const [date, setDate] = useState(moment(curdate).format().slice(0,10))
  const [dateDisableStatus, setDateDisabledStatus] = useState(false)
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
        locale: '',
        name: '',
        sku: '',
        buyUrl: '',
        category: '',
        machineType: '',
        status: '',
        date: '',
        filterStatus: 0
      }
      reader.onload = function (evt) {
        var data = evt.target.result
        let readedData = XLSX.read(data, { type: 'binary' })
        const wsname = readedData.SheetNames[0]
        const ws = readedData.Sheets[wsname]
        const parsedData = XLSX.utils.sheet_to_json(ws)
        parsedData = parsedData.filter(e => Object.keys(e).length > 0)
        var finalData = []
        parsedData.map((e, ind) => {
          var row = { ...rowTemplate }
          Object.keys(e).map((f, i) => {
            if (cleanAndLowercase(f) == 'locale') {
              row.locale = e[f]
            } else if (cleanAndLowercase(f) == 'name') {
              row.name = e[f]
            } else if (cleanAndLowercase(f) == 'sku') {
              row.sku = e[f]
            } else if (cleanAndLowercase(f) == 'buyurl') {
              row.buyUrl = e[f]
            } else if (cleanAndLowercase(f) == 'type') {
              if (e[f].toLowerCase().indexOf('notebook') > -1) {
                row.category = 'Laptop'
              } else if (e[f].toLowerCase().startsWith('desktop')) {
                row.category = 'Desktop'
              } else {
                row.category = e[f]
              }
            } else if (cleanAndLowercase(f) == 'machinetype') {
              row.machineType = e[f]
            } else if (cleanAndLowercase(f) == 'status') {
              row.status = e[f]
              if (
                cleanAndLowercase(e[f]) == 'readded' ||
                cleanAndLowercase(e[f]) == 'added' ||
                cleanAndLowercase(e[f]) == 'new'
              ) {
                row.filterStatus = 1
              }
            }
          })
          if (row.sku.toLowerCase().indexOf('bundle') > -1) {
            row.filterStatus = 0
          }
          var tempCategory = row.category.toLowerCase().split(' ')[0]
          if (tempCategory.endsWith('s')) {
            tempCategory = tempCategory.slice(0, -1)
          }
          var tempCategoryList = categories.filter(e => e.searchCategoryName == tempCategory)
          if (tempCategoryList.length > 0 && tempCategoryList[0].filterStatus == 1 && row.filterStatus == 1) {
            row.filterStatus = 1
          } else {
            row.filterStatus = 0
          }
          row.date = date
          setDateDisabledStatus(true)
          finalData.push(row)
        })
        finalData.sort((a, b) => a.status.localeCompare(b.status))
        finalData.sort((a, b) => b.filterStatus - a.filterStatus)
        var tempWorkableCount = 0
        var tempNonWorkableCount = 0
        finalData.map((o, i) => {
          if (o.filterStatus == 1) {
            tempWorkableCount++
          } else {
            tempNonWorkableCount++
          }
        })
        setCount({
          workable: tempWorkableCount,
          nonWorkable: tempNonWorkableCount
        })
        setExcelData(finalData)
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
    for(var i=0;i<postData.length;i++) {
      postData[i].date = date
    }
    axios.post(AUTH_URL + 'inputUpload?username=' + auth.user.username, postData).then(res => {
      if (res.data && res.status == 200 && res.data.length > 0) {
        toast.success('Input created successfully')
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
        <DialogTitle>Input File Upload</DialogTitle>
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
                      <TableCell>Locale</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Machine Type</TableCell>
                      <TableCell>Workable</TableCell>
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {excelData &&
                    excelData.length > 0 &&
                    excelData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell key={index}>{index + 1}</TableCell>
                        <TableCell key={index}>{row.locale || ''}</TableCell>
                        <TableCell key={index}>{row.name || ''}</TableCell>
                        <TableCell key={index}>{row.sku || ''}</TableCell>
                        <TableCell key={index}>
                          {row.filterStatus == 1 ? (
                            <span style={{ color: 'green' }}>{row.status}</span>
                          ) : (
                            <span style={{ color: 'red' }}>{row.status}</span>
                          )}
                        </TableCell>
                        <TableCell key={index}>{row.category || ''}</TableCell>
                        <TableCell key={index}>{row.machineType || ''}</TableCell>
                        <TableCell key={index}>
                          {row.filterStatus == 1 ? (
                            <span style={{ color: 'green' }}>{'Workable'}</span>
                          ) : (
                            <span style={{ color: 'red' }}>{'Non-Workable'}</span>
                          )}
                        </TableCell>
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
