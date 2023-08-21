import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

const donutColors = {
  series1: '#00d4bd',
  series2: '#ffa1a1',
  series3: '#de425b',
  series4: '#826bf8',
  series5: '#40CDFA'
}

const StatusPieChart = ({ chartData }) => {

  const series = [
    chartData[0].matchedCount,
    chartData[0].matchedFromRedListCount,
    chartData[0].notMatchedCount,
    chartData[0].newDataMatchedCount,
    chartData[0].newDataNotMatchedCount
  ]

  const options = {
    legend: {
      show: true,
      position: 'bottom'
    },
    stroke: { width: 0 },
    labels: ['Matched', 'Matched From Red List', 'Not Matched', 'New Data Matched', 'New Data Not Matched'],
    colors: [donutColors.series1, donutColors.series2, donutColors.series3, donutColors.series4, donutColors.series5],
    dataLabels: {
      enabled: true,
      formatter(val) {
        return `${parseInt(val, 10)}%`
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 992,
        options: {
          chart: {
            height: 380
          },
          legend: {
            position: 'bottom'
          }
        }
      },
      {
        breakpoint: 576,
        options: {
          chart: {
            height: 320
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    fontSize: '1.5rem'
                  },
                  value: {
                    fontSize: '1rem'
                  },
                  total: {
                    fontSize: '1.5rem'
                  }
                }
              }
            }
          }
        }
      }
    ]
  }

  return (
    <Card>
      <CardHeader
        title='SKU Status'
        titleTypographyProps={{ variant: 'h6' }}
        subheader='Chart Based on SKU Report'
        subheaderTypographyProps={{ variant: 'caption', sx: { color: 'text.disabled' } }}
      />
      <CardContent
        sx={{
          '& .apexcharts-canvas .apexcharts-pie .apexcharts-datalabel-label, & .apexcharts-canvas .apexcharts-pie .apexcharts-datalabel-value':
            { fontSize: '1.2rem' }
        }}
      >
        <ReactApexcharts options={options} series={series} type='pie' height={400} />
      </CardContent>
    </Card>
  )
}

export default StatusPieChart
