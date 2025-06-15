import { Box, Divider, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const CheckoutOrderItemsList = ({ orderItems = [], totalAmount = 0 }) => {
  return (
    <Box>
      {orderItems.map((item) => {
        const {
          name = 'Unnamed product',
          price = 0,
          images = [],
          quantity = 1,
        } = item.Product || {
          name: item.productName,
          price: item.price,
          images: [item.image],
          quantity: item.quantity,
        };

        return (
          <Box
            key={item.id || Math.random()}
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
                src={images[0] || 'fallback-image-url.png'}
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

CheckoutOrderItemsList.propTypes = {
  orderItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      Product: PropTypes.shape({
        name: PropTypes.string,
        price: PropTypes.number,
        images: PropTypes.arrayOf(PropTypes.string),
      }),
      productName: PropTypes.string,
      price: PropTypes.number,
      image: PropTypes.string,
      quantity: PropTypes.number,
    })
  ),
  totalAmount: PropTypes.number,
};

CheckoutOrderItemsList.defaultProps = {
  orderItems: [],
  totalAmount: 0,
};

export default CheckoutOrderItemsList;
