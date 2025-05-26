import { Paper, Box } from '@mui/material';
import SearchBar from '../../components/SearchBar/SearchBar';
import UserSearchResults from '../../components/SearchBar/UserSearchResults';

const DesktopSearch = ({ 
  searchInput,
  searchResults,
  searchFocused,
  handleSearchChange,
  handleSearchFocus,
  handleSearchBlur,
  handleResultClick
}) => {
  return (
    <Box sx={{ position: 'relative', width: 240, mr: 2 }}>
      <SearchBar
        value={searchInput}
        onChange={handleSearchChange}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
      {searchFocused && searchResults.length > 0 && (
        <Paper sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1200,
          mt: 1,
          maxHeight: 300,
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

export default DesktopSearch;