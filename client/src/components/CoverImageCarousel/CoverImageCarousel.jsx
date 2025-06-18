import { useState, useEffect } from 'react';
import { Box, IconButton, CircularProgress, useTheme } from '@mui/material';
import { CameraAlt, ChevronLeft, ChevronRight } from '@mui/icons-material';

const CoverImageCarousel = ({
  images = [],
  isMobile,
  onImagesChange,
  isLoading,
  isEditable
}) => {
  const theme = useTheme();
  const [currentImages, setCurrentImages] = useState(images);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    setCurrentImages(images.length ? images : ['/default-cover.jpg']);
    setCurrentIndex(0);
  }, [images]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => URL.createObjectURL(file));
      const updatedImages = [...currentImages, ...newImages].slice(0, 3);
      setCurrentImages(updatedImages);
      if (onImagesChange) onImagesChange(updatedImages);
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  // Auto-rotate images
  useEffect(() => {
    if (currentImages.length > 1) {
      const timer = setInterval(nextImage, 5000);
      return () => clearInterval(timer);
    }
  }, [currentImages.length]);

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: isMobile ? '45vh' : '55vh',
      maxHeight: 500,
      bgcolor: 'grey.200',
      overflow: 'hidden'
    }}>
      {isLoading ? (
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper'
        }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {currentImages.map((img, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transition: 'opacity 0.5s ease',
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 1 : 0
              }}
            >
              <img 
                src={img} 
                alt={`Cover ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          ))}
          
          {/* Navigation arrows */}
          {currentImages.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <ChevronLeft fontSize="large" />
              </IconButton>
              
              <IconButton
                onClick={nextImage}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <ChevronRight fontSize="large" />
              </IconButton>
            </>
          )}
        </>
      )}
      
      {/* Dark overlay gradient */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
        zIndex: 1
      }} />

      {isEditable && (
        <IconButton 
          component="label"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)'
            },
            zIndex: 2
          }}
        >
          <CameraAlt />
          <input 
            hidden 
            accept="image/*" 
            type="file" 
            multiple 
            onChange={handleImageUpload} 
          />
        </IconButton>
      )}
      
      {/* Indicators */}
      {currentImages.length > 1 && (
        <Box sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 2
        }}>
          {currentImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? theme.palette.primary.main : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CoverImageCarousel;