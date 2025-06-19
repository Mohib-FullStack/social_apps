import { Check, Close } from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getPendingRequests,
    getSentRequests
} from '../../features/friendship/friendshipSlice';

const FriendRequestsTab = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  
  const { 
    pendingRequests,
    sentRequests 
  } = useSelector((state) => state.friendship);

  useEffect(() => {
    dispatch(getPendingRequests());
    dispatch(getSentRequests());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAccept = (friendshipId) => {
    // Implement accept logic
  };

  const handleReject = (friendshipId) => {
    // Implement reject logic
  };

  const handleCancel = (friendshipId) => {
    // Implement cancel logic
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label={`Pending (${pendingRequests.data?.length || 0})`} />
        <Tab label={`Sent (${sentRequests.data?.length || 0})`} />
      </Tabs>
      
      <Box sx={{ p: 2 }}>
        {activeTab === 0 ? (
          <>
            {pendingRequests.status === 'loading' ? (
              <CircularProgress />
            ) : pendingRequests.error ? (
              <Typography color="error">
                Error loading pending requests
              </Typography>
            ) : pendingRequests.data?.length === 0 ? (
              <Typography>No pending friend requests</Typography>
            ) : (
              <List>
                {pendingRequests.data?.map((request) => (
                  <ListItem key={request.id} secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        color="success"
                        startIcon={<Check />}
                        onClick={() => handleAccept(request.id)}
                        size="small"
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error"
                        startIcon={<Close />}
                        onClick={() => handleReject(request.id)}
                        size="small"
                      >
                        Decline
                      </Button>
                    </Box>
                  }>
                    <ListItemAvatar>
                      <Avatar src={request.requester?.profileImage} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${request.requester?.firstName} ${request.requester?.lastName}`}
                      secondary="Sent you a friend request"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        ) : (
          <>
            {sentRequests.status === 'loading' ? (
              <CircularProgress />
            ) : sentRequests.error ? (
              <Typography color="error">
                Error loading sent requests
              </Typography>
            ) : sentRequests.data?.length === 0 ? (
              <Typography>No sent friend requests</Typography>
            ) : (
              <List>
                {sentRequests.data?.map((request) => (
                  <ListItem key={request.id} secondaryAction={
                    <Button 
                      variant="outlined" 
                      color="warning"
                      startIcon={<Close />}
                      onClick={() => handleCancel(request.id)}
                      size="small"
                    >
                      Cancel
                    </Button>
                  }>
                    <ListItemAvatar>
                      <Avatar src={request.recipient?.profileImage} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${request.recipient?.firstName} ${request.recipient?.lastName}`}
                      secondary={
                        <>
                          <Box component="span" display="block">
                            Request sent
                          </Box>
                          <Box component="span" display="block" fontStyle="italic">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default FriendRequestsTab;