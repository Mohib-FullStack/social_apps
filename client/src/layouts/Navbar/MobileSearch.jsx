import { Paper, Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import SearchBar from '../../components/SearchBar/SearchBar';
import UserSearchResults from '../../components/SearchBar/UserSearchResults';

const MobileSearch = ({ 
  mobileSearchOpen,
  searchInput,
  searchResults,
  searchFocused,
  toggleMobileSearch,
  handleSearchChange,
  handleSearchFocus,
  handleSearchBlur,
  handleResultClick
}) => {
  if (!mobileSearchOpen) return null;

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1300,
      bgcolor: 'background.paper',
      p: 1,
      boxShadow: 1,
      display: 'flex',
      alignItems: 'center'
    }}>
      <IconButton onClick={toggleMobileSearch}>
        <ArrowBack />
      </IconButton>
      <Box sx={{ flexGrow: 1, mx: 1 }}>
        <SearchBar
          value={searchInput}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          autoFocus
        />
      </Box>
      {searchFocused && searchResults.length > 0 && (
        <Paper sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1400,
          mt: 1,
          maxHeight: '60vh',
          overflow: 'auto'
        }}>
          <UserSearchResults 
            results={searchResults} 
            onResultClick={handleResultClick} 
          />
        </Paper>
      )}
    </Box>
  );
};

export default MobileSearch;