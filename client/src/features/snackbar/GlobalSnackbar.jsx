// // src/features/snackbar/GlobalSnackbar.jsx
// import { Alert, Snackbar } from '@mui/material'
// import { useDispatch, useSelector } from 'react-redux'
// import { hideSnackbar } from './snackbarSlice'

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch()
//   const { open, message, severity } = useSelector((state) => state.snackbar)

//   const handleClose = () => {
//     dispatch(hideSnackbar())
//   }

//   return (
//     <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
//       <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
//         {message}
//       </Alert>
//     </Snackbar>
//   )
// }

// export default GlobalSnackbar


//! updated
import { Alert, Slide, Snackbar } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { removeSnackbar } from './snackbarSlice'

const SlideTransition = (props) => <Slide {...props} direction="left" />

const GlobalSnackbar = () => {
  const dispatch = useDispatch()
  const snackbars = useSelector((state) => state.snackbar.messages)

  return (
    <>
      {snackbars.map(({ id, message, severity, duration }) => (
        <Snackbar
          key={id}
          open
          autoHideDuration={duration}
          onClose={() => dispatch(removeSnackbar(id))}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 1 }}
        >
          <Alert
            severity={severity}
            onClose={() => dispatch(removeSnackbar(id))}
            variant="filled"
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor:
                severity === 'success'
                  ? '#2e7d32'
                  : severity === 'error'
                  ? '#c62828'
                  : severity === 'warning'
                  ? '#ed6c02'
                  : '#0288d1',
            }}
          >
            {message}
          </Alert>
        </Snackbar>
      ))}
    </>
  )
}

export default GlobalSnackbar
