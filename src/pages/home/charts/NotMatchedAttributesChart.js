import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

const columnColors = {
  series1: '#F84F31'
}

const NotMatchedAttributesChart = ({chartData}) => {

  const attributesName = chartData.map(data => data.attributeName);
  const count = chartData.map(data => data.count);

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
        borderRadius: 8,
        startingShape: 'rounded',
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
    colors: [columnColors.series1],

    grid: {
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    xaxis: {
      categories: attributesName
    },
    fill: {
      opacity: 1
    }
  }

  
  const series = [
    {
      name: 'Not Matched Attributes',
      data: count
    }
  ];

  return (
    <Card>
      <CardHeader
        title='Not Matched Attributes'
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

export default NotMatchedAttributesChart
