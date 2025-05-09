import { Box, Divider, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const OrderTrackItemsList = ({ orderItems, totalAmount }) => {
  return (
    <Box>
      {orderItems.map((item, index) => {
        const {
          name = 'Unnamed Product',
          price = 0,
          images = [],
          quantity = 1,
        } = item;

        return (
          <Box
            key={item.id || index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src={images[0] || '/default-image.jpg'}
                alt={name}
                sx={{
                  width: 40,
                  height: 40,
                  marginRight: 2,
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <Typography>{name}</Typography>
            </Box>
            <Typography>€{price.toFixed(2)}</Typography>
            <Typography>x {quantity}</Typography>
            <Typography>€{(price * quantity).toFixed(2)}</Typography>
          </Box>
        );
      })}

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" textAlign="right">
        Total: €{totalAmount.toFixed(2)}
      </Typography>
    </Box>
  );
};

OrderTrackItemsList.propTypes = {
  orderItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      price: PropTypes.number,
      images: PropTypes.arrayOf(PropTypes.string),
      quantity: PropTypes.number,
    })
  ),
  totalAmount: PropTypes.number,
};

OrderTrackItemsList.defaultProps = {
  orderItems: [],
  totalAmount: 0,
};

export default OrderTrackItemsList;
