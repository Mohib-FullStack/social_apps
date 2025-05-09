import { Box, Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SliderContainer = styled(Box)({
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
  height: '500px',
})

const Slide = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'currentSlide' && prop !== 'index',
})(({ currentSlide, index }) => ({
  minWidth: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'transform 0.5s ease-in-out',
  transform: `translateX(-${currentSlide * 100}%)`,
  opacity: currentSlide === index ? 1 : 0.5,
}))

const SlideContent = styled(Box)({
  padding: '20px',
})

const SlideImage = styled('img')({
  width: '50%',
  height: 'auto',
})

const slides = [
  {
    text: 'Summer Sale Collections',
    description: 'Sale! Up to 50% off!',
    buttonText: 'SHOP NOW',
    imageUrl: './summer.jpg',
    path: '/details1',
  },
  {
    text: 'Winter Sale Collections',
    description: 'Sale! Up to 50% off!',
    buttonText: 'SHOP NOW',
    imageUrl: './summer-1.jpg',
    path: '/details2',
  },
  {
    text: 'Spring Sale Collections',
    description: 'Sale! Up to 50% off!',
    buttonText: 'SHOP NOW',
    imageUrl: './summer-2.jpg',
    path: '/details3',
  },
]

const Slider = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <SliderContainer>
      {slides.map((slide, index) => (
        <Slide key={index} currentSlide={currentSlide} index={index}>
          {/* Slide Content */}
          <SlideContent>
            <Typography variant="h4" gutterBottom>
              {slide.text}
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {slide.description}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(slide.path)}
              sx={{
                mt: 2,
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: '#ff9800',
                },
              }}
            >
              {slide.buttonText}
            </Button>
          </SlideContent>

          {/* Slide Image */}
          <SlideImage src={slide.imageUrl} alt={slide.text} />
        </Slide>
      ))}
    </SliderContainer>
  )
}

export default Slider


