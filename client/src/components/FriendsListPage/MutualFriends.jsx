// MutualFriends.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMutualFriends } from '../features/friendship/friendshipSlice';

const MutualFriends = ({ userId }) => {
  const dispatch = useDispatch();
  const {
    mutualFriends,
    mutualFriendsStatus,
    mutualFriendsError
  } = useSelector(state => state.friendship);

  useEffect(() => {
    dispatch(fetchMutualFriends({ userId, page: 1 }));
  }, [dispatch, userId]);

  return (
    <div>
      {mutualFriendsStatus === 'loading' && <CircularProgress />}
      {mutualFriendsStatus === 'succeeded' && (
        <>
          <Typography variant="h6">
            {mutualFriends.pagination.totalItems} Mutual Friends
          </Typography>
          <Grid container spacing={2}>
            {mutualFriends.data.map(friend => (
              <Grid item xs={12} sm={6} key={friend.id}>
                <FriendCard friend={friend} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
};

export default  MutualFriends