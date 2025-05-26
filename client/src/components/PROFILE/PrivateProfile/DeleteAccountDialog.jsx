import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Delete } from '@mui/icons-material';

const DeleteAccountDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Confirm Account Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete your account? This action cannot be undone. 
          All your data will be permanently removed from our servers.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={onConfirm} color="error" autoFocus startIcon={<Delete />}>
          Delete Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog;