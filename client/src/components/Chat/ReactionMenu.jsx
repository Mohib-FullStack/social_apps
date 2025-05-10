import { Popover } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';

 const ReactionMenu = ({ anchorEl, onClose, onSelect }) => {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <EmojiPicker 
        onEmojiClick={(emoji) => {
          onSelect(emoji.emoji);
          onClose();
        }} 
        width={300}
        height={350}
      />
    </Popover>
  );
};

export default ReactionMenu