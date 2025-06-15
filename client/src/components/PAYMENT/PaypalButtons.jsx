import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { payOrder } from '../../features/order/orderSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCartState } from '../../features/cart/cartSlice';
import axiosInstance from '../../axiosInstance';

export default function PaypalButtons({ order }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId:
          'AUWcnaHjOUoXVI3IjLpMkM0Kk0Sigq1CUAWP-finHI950yQD2Qni8XPkRbs76Q-_JIT8hJFhKD8YVy3u',
      }}
    >
      <PaypalButtonLogic order={order} />
    </PayPalScriptProvider>
  );
}

function PaypalButtonLogic({ order }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!order || !order.totalPrice || !order.items) {
    console.error('Invalid order data:', order);
    return <div>Error loading PayPal buttons. Please try again later.</div>;
  }

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: order.totalPrice.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: order.totalPrice.toFixed(2),
              },
            },
          },
          items: order.items.map((item) => ({
            name: item.name,
            unit_amount: {
              currency_code: 'USD',
              value: item.price.toFixed(2),
            },
            quantity: item.quantity.toString(),
          })),
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      // Finalize the transaction
      const details = await actions.order.capture();
      console.log('Payment successful:', details);

      // Extract relevant data from the PayPal response
      const paymentId = details.id;

      // Dispatch the payOrder action with orderId and paymentId
      const result = await dispatch(
        payOrder({
          paymentId: paymentId,
          orderId: order.id,
        })
      ).unwrap();

      // Notify the server to clear the cart
      await axiosInstance.post('/cart/clear', {}, { withCredentials: true });

      // Clear the cart state in Redux
      dispatch(clearCartState());

      // Notify the user
      dispatch(
        showSnackbar({
          message: 'Payment successful! Your cart has been cleared.',
          severity: 'success',
        })
      );

      // Navigate to the order tracking page
      navigate(`/track/${result.orderId}`);
    } catch (error) {
      console.error('Error finalizing payment:', error);
      dispatch(
        showSnackbar({
          message:
            'Payment successful, but failed to clear the cart or update order status.',
          severity: 'error',
        })
      );
    }
  };

  const onError = (error) => {
    console.error('Payment error:', error);
    dispatch(
      showSnackbar({
        message: 'Payment could not be processed. Please try again later.',
        severity: 'error',
      })
    );
  };

  return (
    <PayPalButtons
      style={{ layout: 'vertical' }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
    />
  );
}
