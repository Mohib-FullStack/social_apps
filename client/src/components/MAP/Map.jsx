import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types'; // Import PropTypes
import { Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const Map = ({ initialPosition, onPositionChange }) => {
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const dispatch = useDispatch();

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setSelectedPosition([lat, lng]);
    onPositionChange([lat, lng]); // Notify parent component of position change
    dispatch(
      showSnackbar({
        message: `Location selected: ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
        severity: 'info',
      })
    );
  };

  return (
    <Box
      sx={{
        height: 400,
        border: '3px solid',
        borderRadius: 2,
        borderImageSource: 'linear-gradient(to right, #ff7eb3, #65e9ff)',
        borderImageSlice: 1,
        overflow: 'hidden',
      }}
    >
      <MapContainer
        center={selectedPosition}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        onClick={handleMapClick}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={selectedPosition}>
          <Popup>Your selected delivery location</Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

// PropTypes validation
Map.propTypes = {
  initialPosition: PropTypes.arrayOf(PropTypes.number).isRequired, // Ensure an array of numbers
  onPositionChange: PropTypes.func.isRequired, // Ensure a function is passed
};

export default Map;




























