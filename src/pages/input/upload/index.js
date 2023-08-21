import { FileUploadOutlined } from '@mui/icons-material'
import { Box, Button, Card, Grid, Icon, IconButton, TextField, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import DataGrid, { SelectColumn } from 'react-data-grid'
import moment from 'moment/moment'
import Link from 'next/link'
import { useState } from 'react'
import UploadExcel from './upload'
import { useEffect } from 'react'
import axios from 'axios'
import 'react-data-grid/lib/styles.css'
import { useMemo } from 'react'
import { exportToXLSX } from 'src/components/ExportToXlsx'
import { Delete, Refresh } from 'mdi-material-ui'
import toast from 'react-hot-toast'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL

const InputUpload = () => {
  const [productsListAll, setProductsListAll] = useState([])
  const [productsList, setProductsList] = useState([])
  const [skuCode, setSkuCode] = useState('')

  const useStyles = makeStyles({
    root: {
      overflow: 'scroll',
      scrollbarWidth: 'thin',
      '-ms-overflow-style': 'none',
      '&::-webkit-scrollbar': {
        width: '8px',
        opacity: 0,
        transition: 'opacity 0.2s'
      },
      '&:hover::-webkit-scrollbar': {
        opacity: 1
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '4px'
      },
      '&:hover::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  })
  const curdate = new Date()
  const [categoriesList, setCategoriesList] = useState([])
  const [open, setOpen] = useState(false)

  const handleDialogToggle = () => {
    setOpen(!open)
    updateData(date)
  }
  const classes = useStyles()
  const [pageSize, setPageSize] = useState(10)
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [sortColumns, setSortColumns] = useState([])
  const [date, setDate] = useState(moment(curdate).format().substring(0, 10))

  const handleFilter = val => {
    setSkuCode(val)
    setProductsList(productsListAll.filter(e => ('' + e['sku']).startsWith(val)))
  }

  function getComparator(sortColumn) {
    switch (sortColumn) {
      case 'date':
      case 'locale':
      case 'sku':
      case 'dapCode':
      case 'category':
      case 'comments':
      case 'status':
        return (a, b) => {
          return a[sortColumn].localeCompare(b[sortColumn])
        }
      case 'sno':
      case 'metricStatus':
      case 'retryCount':
        return (a, b) => {
          return a[sortColumn] - b[sortColumn]
        }
      default:
        throw new Error(`unsupported sortColumn: "${sortColumn}"`)
    }
  }

  const updateData = async filterdate => {
    await axios.get(AUTH_URL + 'getDAPRequestProducts?date=' + filterdate).then(res => {
      var tempData = res.data
      tempData = tempData.map((item, ind) => {
        return { ...item, sno: ind + 1 }
      })
      setProductsList(tempData)
      setProductsListAll(tempData)
    })
    await axios.get(AUTH_URL + 'getCategories').then(res => {
      var tempcategories = res.data
      tempcategories = tempcategories.map(item => {
        if (item.exclusionStatus == 1) {
          return { ...item, filterStatus: 0 }
        } else {
          if (item.categoryName.toLowerCase().endsWith('s')) {
            return { ...item, searchCategoryName: item.categoryName.toLowerCase().slice(0, -1), filterStatus: 1 }
          } else {
            return { ...item, searchCategoryName: item.categoryName.toLowerCase(), filterStatus: 1 }
          }
        }
      })
      setCategoriesList(tempcategories)
    })
  }

  const sortedRows = useMemo(() => {
    if (sortColumns.length === 0) return productsList

    return [...productsList].sort((a, b) => {
      for (const sort of sortColumns) {
        const comparator = getComparator(sort.columnKey)
        const compResult = comparator(a, b)
        if (compResult !== 0) {
          return sort.direction === 'ASC' ? compResult : -compResult
        }
      }

      return 0
    })
  }, [productsList, sortColumns])

  useEffect(() => {
    updateData(date)
  }, [])

  const columnWidths = [0.3, 0.6, 0.5, 1.5, 0.6, 0.6, 0.8, 1.4, 0.3, 0.4, 0.7]

  function rowKeyGetter(row) {
    return row.id
  }

  const headers = {
    sno: '#',
    date: 'Date',
    locale: 'Locale',
    sku: 'SKU',
    dapCode: 'DAP Code',
    category: 'Category',
    status: 'Status',
    comments: 'Comments',
    retryCount: 'Tries',
    existingStatus:'Pre-Existing',
    metricStatus: 'Fetch Status'
  }

  const defaultColumns = [
    SelectColumn,
    {
      key: 'sno',
      width: 30,
      name: '#'
    },
    {
      key: 'date',
      minWidth: 120,
      name: 'Date'
    },
    {
      minWidth: 60,
      key: 'locale',
      name: 'Locale'
    },
    {
      minWidth: 80,
      key: 'sku',
      name: 'SKU'
    },
    {
      minWidth: 80,
      key: 'dapCode',
      name: 'DAP Code'
    },
    {
      minWidth: 80,
      key: 'category',
      name: 'Category'
    },
    {
      minWidth: 80,
      key: 'status',
      name: 'Status'
    },
    {
      minWidth: 80,
      key: 'comments',
      name: 'Comments'
    },
    {
      minWidth: 80,
      key: 'retryCount',
      name: 'Tries'
    },
    {
      minWidth: 80,
      key: 'existingStatus',
      name: 'Pre-Existing',
      renderCell: ({ row }) => (
        <Typography  color={"black"} variant='body2'>
          {row.existingStatus == 1 ? 'Yes' : "No"}
        </Typography>
      )
    },
    {
      minWidth: 80,
      key: 'metricStatus',
      name: 'Fetch Status',
      renderCell: ({ row }) => (
        <Typography variant='body2' color={row.metricStatus == 1 ? 'green' : 'red'}>
          {row.metricStatus == 1 ? 'Fetched' : row.retryCount==0?"Yet to Fetch":row.retryCount==4? 'Unable To Fetch': "Fetching"}
        </Typography>
      )
    }
  ]

  const deleteSelected = async ()=>{
    var arr = []
    selectedRows.forEach((e)=>{
      arr.push(e)
    })
    await axios.delete(AUTH_URL+"deleteDAPRequestProducts",{
      data:arr
    }).then((res)=>{
      if(res.data && res.data>0){
        toast.success("Deleted Successfully");
        updateData(date)
      }else{
        toast.error("Deletion Failed")
        updateData(date)
      }
    })
  }

  const columns = useMemo(() => defaultColumns)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Typography sx={{ margin: '10px', fontWeight: 'bold', textAlign: 'center' }}>
            Product Inputs
          </Typography>
          <Box
            sx={{
              p: 3,
              pb: 3,
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size='small'
                value={date}
                type='date'
                sx={{ mr: 4, mb: 2, maxWidth: '180px' }}
                onChange={e => {
                  setDate(e.target.value)
                  updateData(e.target.value)
                }}
              />
              <TextField
                size='small'
                value={skuCode}
                placeholder='Search SKU'
                sx={{ mr: 4, mb: 2, maxWidth: '150px' }}
                onChange={e => handleFilter(e.target.value)}
              />
              <Button
                sx={{ mr: 4, mb: 2 }}
                variant='contained'
                onClick={() => {
                  exportToXLSX(productsList, headers, 'DAP_Products_Input', date, columnWidths, 2)
                }}
              >
                Export
              </Button>
              <Box>
                <Button
                  sx={{ mr: 4, mb: 2 }}
                  color='secondary'
                  variant='outlined'
                  startIcon={<FileUploadOutlined />}
                  onClick={handleDialogToggle}
                >
                  Import
                </Button>
              </Box>
              <IconButton onClick={()=>{
                deleteSelected()
              }}>
                <Delete/>
              </IconButton>
              <IconButton onClick={()=>{
                updateData(date)
              }}>
                <Refresh/>
              </IconButton>
            </Box>
          </Box>
          {open && (
            <UploadExcel
              categories={categoriesList}
              open={open}
              handleDialogToggle={handleDialogToggle}
              setOpen={setOpen}
            />
          )}

          <div className={classes.root}>
            <DataGrid
              columns={columns}
              rows={sortedRows}
              rowKeyGetter={rowKeyGetter}
              rowsCount={productsList.length}
              style={{ minHeight: '600px' }}
              selectedRows={selectedRows}
              onRowsChange={setProductsList}
              onSelectedRowsChange={setSelectedRows}
              sortColumns={sortColumns}
              onSortColumnsChange={setSortColumns}
              defaultColumnOptions={{
                sortable: true,
                resizable: true
              }}
              className='fill-grid'
            />
          </div>
        </Card>
      </Grid>
    </Grid>
  )
}

export default InputUpload
