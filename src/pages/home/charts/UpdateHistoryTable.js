// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'


const UpdateHistoryTable = ({ rows }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='Update History'>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell align='center'>Name</TableCell>
            <TableCell align='center'>Date</TableCell>
            <TableCell align='center'>File Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index + 1}
              sx={{
                '&:last-of-type td, &:last-of-type th': {
                  border: 0
                }
              }}
            >
              <TableCell component='th' scope='row'>
                {index + 1}
              </TableCell>
              <TableCell align='center'>{row.name}</TableCell>
              <TableCell align='center'>{row.date}</TableCell>
              <TableCell align='center'>{row.fileDate != null && row.fileDate != '' ? row.fileDate : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default UpdateHistoryTable
