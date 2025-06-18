//! deepseek
import { Close, Search } from '@mui/icons-material';
import { IconButton, InputBase, Paper } from '@mui/material';

const SearchBar = ({ value, onChange, onFocus, onBlur }) => {
  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        borderRadius: 4,
        boxShadow: 2
      }}
    >
      <IconButton sx={{ p: '10px' }} aria-label="search">
        <Search />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search users..."
        inputProps={{ 'aria-label': 'search users' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {value && (
        <IconButton onClick={() => onChange('')} sx={{ p: '10px' }}>
          <Close />
        </IconButton>
      )}
    </Paper>
  );
};

export default SearchBar;






