import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

const columnColors = {
  series1: '#00d4bd',
  series2: '#F84F31'
}

const InputStatusChart = ({chartData}) => {

  const dates = chartData.map(data => data.date);
  const fetchedCounts = chartData.map(data => data.fetchedCount);
  const notFetchedCounts = chartData.map(data => data.notFetchedCount);

  const options = {
    chart: {
      offsetX: -10,
      stacked: true,
      parentHeightOffset: 0,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '20%',
        colors: {
          backgroundBarRadius: 10,
        }
      }
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          plotOptions: {
            borderRadius: 8,
            bar: {
              columnWidth: '35%'
            }
          }
        }
      }
    ],
    dataLabels: {
      enabled: true
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    },
    colors: [columnColors.series1, columnColors.series2],
    
    grid: {
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    xaxis: {
      categories: dates,
      type: 'datetime' // Use datetime type for x-axis
    },
    fill: {
      opacity: 1
    }
  }

  
  const series = [
    {
      name: 'Fetched Count',
      data: fetchedCounts
    },
    {
      name: 'Not Fetched Count',
      data: notFetchedCounts
    }
  ];

  return (
    <Card>
      <CardHeader
        title='Workable Counts'
        titleTypographyProps={{ variant: 'h6' }}
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] }
        }}
      />
      <CardContent>
        <ReactApexcharts options={options} series={series} type='bar' height={400} />
      </CardContent>
    </Card>
  )
}

export default InputStatusChart
