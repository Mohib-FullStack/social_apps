import { useDispatch } from 'react-redux';
import { checkFriendshipStatus } from '../../features/friendship/friendshipSlice';


const useFriendshipStatus = (userId) => {
  const dispatch = useDispatch();
  const status = useSelector(
    (state) => state.friendship.statusLookup[userId] || { status: 'none' }
  );

  useEffect(() => {
    if (userId) {
      dispatch(checkFriendshipStatus(userId));
    }
  }, [dispatch, userId]);

  return status;
};


export default useFriendshipStatus