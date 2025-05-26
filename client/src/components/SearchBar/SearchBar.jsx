// src/components/SearchBar/SearchBar.jsx
// import { Clear, Search } from '@mui/icons-material';
// import { IconButton, InputBase, Paper } from '@mui/material';
// import { useRef } from 'react';

// const SearchBar = ({ value, onChange }) => {
//   const inputRef = useRef(null);

//   const handleChange = (e) => {
//     onChange(e.target.value);
//   };

//   const handleClear = () => {
//     onChange('');
//     inputRef.current?.focus();
//   };

//   return (
//     <Paper
//       elevation={3}
//       sx={{
//         p: '2px 8px',
//         display: 'flex',
//         alignItems: 'center',
//         width: '100%',
//         maxWidth: 400,
//         mx: 'auto',
//         borderRadius: 3,
//         backgroundColor: '#f1f3f4',
//         minHeight: 40, // Ensure consistent height
//       }}
//     >
//       <Search color="action" />
//       <InputBase
//         inputRef={inputRef}
//         sx={{ ml: 1, flex: 1 }}
//         placeholder="Search users..."
//         inputProps={{ 'aria-label': 'search users' }}
//         value={value}
//         onChange={handleChange}
//         autoFocus
//       />
//       {value && (
//         <IconButton onClick={handleClear} size="small">
//           <Clear />
//         </IconButton>
//       )}
//     </Paper>
//   );
// };

// export default SearchBar;




//! test
// src/components/SearchBar/SearchBar.jsx
// import { Clear, Search } from '@mui/icons-material';
// import { IconButton, InputBase, Paper,Box } from '@mui/material';
// import { useRef, useState } from 'react';

// const SearchBar = ({ value, onChange, onFocus, onBlur, showResults, results }) => {
//   const inputRef = useRef(null);
//   const [focused, setFocused] = useState(false);

//   const handleChange = (e) => {
//     onChange(e.target.value);
//   };

//   const handleClear = () => {
//     onChange('');
//     inputRef.current?.focus();
//   };

//   const handleFocus = (e) => {
//     setFocused(true);
//     onFocus?.(e);
//   };

//   const handleBlur = (e) => {
//     setFocused(false);
//     onBlur?.(e);
//   };

//   return (
//     <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
//       <Paper
//         elevation={3}
//         sx={{
//           p: '2px 8px',
//           display: 'flex',
//           alignItems: 'center',
//           width: '100%',
//           mx: 'auto',
//           borderRadius: 3,
//           backgroundColor: '#f1f3f4',
//           minHeight: 40,
//         }}
//       >
//         <Search color="action" />
//         <InputBase
//           inputRef={inputRef}
//           sx={{ ml: 1, flex: 1 }}
//           placeholder="Search users..."
//           inputProps={{ 'aria-label': 'search users' }}
//           value={value}
//           onChange={handleChange}
//           onFocus={handleFocus}
//           onBlur={handleBlur}
//           autoFocus
//         />
//         {value && (
//           <IconButton onClick={handleClear} size="small">
//             <Clear />
//           </IconButton>
//         )}
//       </Paper>

//       {showResults && focused && value && results.length > 0 && (
//         <UserSearchResults 
//           users={results} 
//           onSelect={() => {
//             onChange('');
//             inputRef.current?.blur();
//           }}
//         />
//       )}
//     </Box>
//   );
// };

// export default SearchBar;

//! new
/*
File: components/PROFILE/SearchBar.jsx
*/
// import { Paper, IconButton, InputBase } from '@mui/material';
// import { Search, Close } from '@mui/icons-material';

// const SearchBar = ({ value, onChange, onFocus, onBlur }) => (
//   <Paper
//     component="form"
//     sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600, borderRadius: 4, boxShadow: 2 }}
//   >
//     <IconButton sx={{ p: '10px' }} aria-label="search">
//       <Search />
//     </IconButton>
//     <InputBase
//       sx={{ ml: 1, flex: 1 }}
//       placeholder="Search users..."
//       inputProps={{ 'aria-label': 'search users' }}
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       onFocus={onFocus}
//       onBlur={onBlur}
//     />
//     {value && (
//       <IconButton onClick={() => onChange('')} sx={{ p: '10px' }}>
//         <Close />
//       </IconButton>
//     )}
//   </Paper>
// );

// export default SearchBar;


//! last
// import { Close, Search } from '@mui/icons-material';
// import { IconButton, InputBase, Paper } from '@mui/material';

// const SearchBar = ({ value, onChange, onFocus, onBlur }) => (
//   <Paper
//     component="form"
//     sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600, borderRadius: 4, boxShadow: 2 }}
//   >
//     <IconButton sx={{ p: '10px' }} aria-label="search">
//       <Search />
//     </IconButton>
//     <InputBase
//       sx={{ ml: 1, flex: 1 }}
//       placeholder="Search users..."
//       inputProps={{ 'aria-label': 'search users' }}
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       onFocus={onFocus}
//       onBlur={onBlur}
//     />
//     {value && (
//       <IconButton onClick={() => onChange('')} sx={{ p: '10px' }}>
//         <Close />
//       </IconButton>
//     )}
//   </Paper>
// );

// export default SearchBar;



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






