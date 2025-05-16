// src/components/SearchBar/SearchBar.jsx
import { Clear, Search } from '@mui/icons-material';
import { IconButton, InputBase, Paper } from '@mui/material';
import { useRef } from 'react';

const SearchBar = ({ value, onChange }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: '2px 8px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
        borderRadius: 3,
        backgroundColor: '#f1f3f4',
        minHeight: 40, // Ensure consistent height
      }}
    >
      <Search color="action" />
      <InputBase
        inputRef={inputRef}
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search users..."
        inputProps={{ 'aria-label': 'search users' }}
        value={value}
        onChange={handleChange}
        autoFocus
      />
      {value && (
        <IconButton onClick={handleClear} size="small">
          <Clear />
        </IconButton>
      )}
    </Paper>
  );
};

export default SearchBar;























