import React from 'react'
import { Button, Typography, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Slider from '../SLIDER/Slider'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: 3,
      }}
    >
      <Slider />
    </Box>
  )
}

export default HomePage
