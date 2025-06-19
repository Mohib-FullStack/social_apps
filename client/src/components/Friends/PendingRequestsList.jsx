import {
    CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingRequests } from '../../features/friendship/friendshipSlice';


const PendingRequestsList = () => {
  const dispatch = useDispatch();
  const { data, pagination, status, error } = useSelector(
    (state) => state.friendship.pendingRequests
  );

  useEffect(() => {
    dispatch(getPendingRequests());
  }, [dispatch]);

  if (status === 'loading') return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <List>
      {data.map((request) => (
        <FriendRequestItem 
          key={request.id} 
          request={request} 
        />
      ))}
    </List>
  );
};


export default PendingRequestsList