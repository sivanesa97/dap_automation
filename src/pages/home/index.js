// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import axios from 'axios'
import InputStatusChart from './charts/InputStatusChart'
import NotMatchedAttributesChart from './charts/NotMatchedAttributesChart'
import StatusPieChart from './charts/StatusPieChart'
import UpdateHistoryTable from './charts/UpdateHistoryTable'

const Home = () => {
  const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  var curdate = new Date()

  const [fromDate, setFromDate] = useState(moment(curdate).format().slice(0, 10))
  const [toDate, setToDate] = useState(moment(curdate).format().slice(0, 10))
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [countries, setCountries] = useState([])
  const [categories, setCategories] = useState([])
  const [updateHistory, setUpdateHistory] = useState([])
  const [inputStatusChart, setInputStatusChart] = useState([])
  
  const [statusPieChartData, setStatusPieChartData] = useState([
    {
      matchedCount: 0,
      notMatchedCount: 0,
      matchedFromRedListCount: 0,
      newDataMatchedCount: 0,
      newDataNotMatchedCount: 0
    }
  ])
  const [notMatchedAttributesChartData, setNotMatchedAttributesChartData] = useState([])

  useEffect(() => {
    Promise.all([axios.get(AUTH_URL + 'getCategories'), axios.get(AUTH_URL + 'getAllCountries')]).then(res => {
      // console.log(res[1].data.filter(e => e.isActive == 1))
      setCategories(res[0].data.filter(e => e.exclusionStatus == 0 && e.isActive == 1))
      setCountries(res[1].data.filter(e => e.isActive == 1))
    })
  }, [])
  
  const fetchData = useCallback(() => {
    var params =
      '?fromDate=' + fromDate + '&toDate=' + toDate + '&dapCode=' + selectedCountry + '&category=' + selectedCategory;

    Promise.all([
      axios.get(AUTH_URL + 'getInputStatusChartData' + params),
      axios.get(AUTH_URL + 'getNotMatchedAttributesChartData' + params),
      axios.get(AUTH_URL + 'getStatusPieChartData' + params),
      axios.get(AUTH_URL + 'updateHistory')
    ]).then(res => {
      setInputStatusChart(res[0].data)
      setNotMatchedAttributesChartData(res[1].data)
      setStatusPieChartData(res[2].data)
      setUpdateHistory(res[3].data)
    });
  }, [fromDate, toDate, selectedCountry, selectedCategory]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
    
  }, [fetchData]);

  const handleFromDateChange = e => {
    setFromDate(e.target.value)
  }

  const handleToDateChange = e => {
    setToDate(e.target.value)
  }

  const handleCountryChange = event => {
    setSelectedCountry(event.target.value)
  }

  const handleCategoryChange = event => {
    setSelectedCategory(event.target.value)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Dashboard'></CardHeader>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item md={3} sm={6} xs={12}>
                <TextField
                  name='fromDate'
                  label='From Date'
                  value={fromDate}
                  InputLabelProps={{ shrink: true }}
                  type='date'
                  sx={{ minWidth: '200px' }}
                  onChange={handleFromDateChange}
                  variant='outlined'
                />
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <TextField
                  name='toDate'
                  label='To Date'
                  value={toDate}
                  InputLabelProps={{ shrink: true }}
                  type='date'
                  sx={{ minWidth: '200px' }}
                  onChange={handleToDateChange}
                  variant='outlined'
                />
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <TextField
                  select
                  name='country'
                  variant='outlined'
                  label='Country'
                  sx={{ minWidth: '200px' }}
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  <MenuItem value=''>All</MenuItem>
                  {countries.map(country => (
                    <MenuItem key={country.dapCode} value={country.dapCode}>
                      {country.dapCode}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <TextField
                  name='category'
                  variant='outlined'
                  select
                  sx={{ minWidth: '200px' }}
                  label='Category'
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <MenuItem value=''>All</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.categoryName} value={category.categoryName}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={3}>
              <Grid item md={12} sm={12} xs={12}>
                <InputStatusChart chartData={inputStatusChart} />
              </Grid>
              <Grid item md={6} sm={12} xs={12}>
                <NotMatchedAttributesChart chartData={notMatchedAttributesChartData} />
              </Grid>
              <Grid item md={6} sm={12} xs={12}>
                <StatusPieChart chartData={statusPieChartData} />
              </Grid>
              <Grid item md={12} sm={12} xs={12}>
                <Card>

                  <CardHeader title='Update History' titleTypographyProps={{ variant: 'h6' }} />
                  <UpdateHistoryTable rows={updateHistory} />
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Home
