import { FileUploadOutlined } from '@mui/icons-material'
import { Box, Button, Card, Grid, IconButton, TextField, Typography } from '@mui/material'
import { makeStyles, useTheme } from '@mui/styles'
import DataGrid, { textEditor } from 'react-data-grid'
import moment from 'moment/moment'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import 'react-data-grid/lib/styles.css'
import axios from 'axios'
import { exportToXLSX } from 'src/components/ExportToXlsx'
import { Refresh } from 'mdi-material-ui'
import { ThemeProvider } from '@emotion/react'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL

const InputUpload = () => {
  const [allRows, setAllRows] = useState([])
  const [rows, setRows] = useState([])
  const [skuCode, setSkuCode] = useState('')

  useEffect(() => {
    updateData(date)
  }, [date])

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
  const classes = useStyles()
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [sortColumns, setSortColumns] = useState([])
  const [date, setDate] = useState(moment(curdate).format().substring(0, 10))

  function getComparator(sortColumn) {
    switch (sortColumn) {
      case 'attributeName':
      case 'locale':
      case 'sku':
      case 'dapCode':
      case 'stringValue':
      case 'dapValue':
      case 'category':
      case 'comments':
      case 'rule':
        return (a, b) => {
          return a[sortColumn].localeCompare(b[sortColumn])
        }
      case 'sno':
      case 'newDataCheckStatus':
      case 'verificationStatus':
        return (a, b) => {
          return a[sortColumn] - b[sortColumn]
        }
      default:
        throw new Error(`unsupported sortColumn: "${sortColumn}"`)
    }
  }

  const sortedRows = useMemo(() => {
    if (sortColumns.length === 0) return rows

    return [...rows].sort((a, b) => {
      for (const sort of sortColumns) {
        const comparator = getComparator(sort.columnKey)
        const compResult = comparator(a, b)
        if (compResult !== 0) {
          return sort.direction === 'ASC' ? compResult : -compResult
        }
      }

      return 0
    })
  }, [rows, sortColumns])

  const updateData = async filterdate => {
    await axios.get(AUTH_URL + 'getDAPRequestProductsReport?date=' + filterdate).then(res => {
      var tempData = res.data
      tempData = tempData.map((item, ind) => {
        return { ...item, sno: ind + 1 }
      })
      setRows(tempData)
      setAllRows(tempData)
    })
  }

  const headers = {
    sno: '#',
    locale: 'Locale',
    attributeName: 'Attribute Name',
    sku: 'SKU',
    category: 'Category',
    dapCode: 'DAP Code',
    stringValue: 'String Value',
    dapValue: 'DAP Value',
    rule: 'Rule',
    comments: 'Comments',
    newDataCheckStatus: 'New Data Status',
    existingStatus: 'Pre-Existing',
    verificationStatus: 'Match Status'
  }

  const columnWidths = [0.3, 0.6, 1.6, 1.5, 0.7, 0.4, 4, 4, 2, 1.2, 1.2, 0.4, 1.2]

  const defaultColumns = [
    {
      key: 'sno',
      name: '#',
      width: 30
    },
    {
      key: 'locale',
      name: 'Locale',
      width: 100
    },
    {
      key: 'attributeName',
      name: 'Attribute Name',
      width: 150
    },
    {
      key: 'sku',
      name: 'SKU',
      width: 120
    },
    {
      key: 'dapCode',
      name: 'DAP Code',
      width: 100
    },
    {
      key: 'category',
      name: 'Category',
      width: 100
    },
    {
      key: 'stringValue',
      name: 'String Value',
      width: 240
    },
    {
      key: 'dapValue',
      name: 'Dap Value',
      width: 240,
      editable: true,
      renderEditCell: textEditor
    },
    {
      key: 'rule',
      name: 'Rule',
      width: 200
    },
    {
      key: 'comments',
      name: 'Comments',
      width: 200,
      sortable: false
    },
    {
      minWidth: 80,
      key: 'existingStatus',
      name: 'Pre-Existing',
      renderCell: ({ row }) => (
        <Typography color={'black'} variant='body2'>
          {row.existingStatus == 1 ? 'Yes' : 'No'}
        </Typography>
      )
    },
    {
      key: 'newDataCheckStatus',
      name: 'New Data Status',
      width: 200,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Typography
            variant='body2'
            color={row.newDataCheckStatus === 2 ? 'green' : row.newDataCheckStatus == 0 ? '' : 'red'}
          >
            {row.newDataCheckStatus === 2
              ? 'New Data Matched'
              : row.newDataCheckStatus == 1
              ? 'New Data Not Matched'
              : ''}
          </Typography>
        )
      }
    },
    {
      key: 'verificationStatus',
      name: 'Match Status',
      width: 100,
      renderCell: ({ row }) => {
        return (
          <Typography variant='body2' color={row.verificationStatus === 1 ? 'green' : 'red'}>
            {row.verificationStatus === 1
              ? row.additionalStatus == 1
                ? 'Matched from Red List'
                : 'Matched'
              : 'Not Matched'}
          </Typography>
        )
      }
    }
  ]

  function rowKeyGetter(row) {
    return row.id
  }

  const columns = useMemo(() => defaultColumns)

  const handleFilter = val => {
    setSkuCode(val)
    setRows(allRows.filter(e => ('' + e['sku']).startsWith(val)))
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Typography sx={{ margin: '10px', fontWeight: 'bold', textAlign: 'center' }}>
            Product Attributes Report
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
                  exportToXLSX(rows, headers, 'DAP_Report', date, columnWidths, 1)
                }}
              >
                Export
              </Button>
              <IconButton
                onClick={() => {
                  updateData(date)
                }}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Box>
          <div className={classes.root} style={{ overflowX: 'auto', width: '100%' }}>
            <ThemeProvider theme={useTheme()}>
              <DataGrid
                columns={columns}
                rows={sortedRows}
                rowKeyGetter={rowKeyGetter}
                rowsCount={rows.length}
                style={{ minHeight: '600px' }}
                selectedRows={selectedRows}
                onRowsChange={setRows}
                onSelectedRowsChange={setSelectedRows}
                sortColumns={sortColumns}
                onSortColumnsChange={setSortColumns}
                defaultColumnOptions={{
                  sortable: true,
                  resizable: true
                }}
                class
                Name='fill-grid'
              />
            </ThemeProvider>
          </div>
        </Card>
      </Grid>
    </Grid>
  )
}

export default InputUpload
