// src/components/PRODUCT/ImageCarousel.jsx
import React from 'react'
import { Box, Typography } from '@mui/material'

const ImageCarousel = ({ images }) => {
  return (
    <Box>
      {images && images.length > 0 ? (
        images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Product Image ${index + 1}`}
            style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
          />
        ))
      ) : (
        <Typography>No images available</Typography>
      )}
    </Box>
  )
}

export default ImageCarousel
