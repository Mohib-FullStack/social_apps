import React from 'react'
import './NotFound.css' // Make sure to create and import the CSS file

const NotFound = () => {
  return (
    <div className="error-container">
      <h1 className="error-code">404</h1>
      <p className="error-message">
        Oops! The page you're looking for doesn't exist.
      </p>
      <div className="animation">
        <span className="dot dot1"></span>
        <span className="dot dot2"></span>
        <span className="dot dot3"></span>
      </div>
    </div>
  )
}

export default NotFound

//! test
// import React from 'react';

// const NotFound = () => {
//   const styles = {
//     container: {
//       textAlign: 'center',
//       padding: '50px',
//       fontFamily: 'Arial, sans-serif',
//     },
//     errorCode: {
//       fontSize: '100px',
//       margin: '0',
//       color: '#ff6f61',
//       animation: 'fadeIn 1s ease-in-out',
//     },
//     errorMessage: {
//       fontSize: '20px',
//       marginTop: '10px',
//       color: '#333',
//       animation: 'fadeIn 2s ease-in-out',
//     },
//     animation: {
//       marginTop: '20px',
//     },
//     dot: {
//       height: '15px',
//       width: '15px',
//       margin: '5px',
//       backgroundColor: '#ff6f61',
//       borderRadius: '50%',
//       display: 'inline-block',
//       animation: 'bounce 1.5s infinite',
//     },
//     dot1: { animationDelay: '0s' },
//     dot2: { animationDelay: '0.3s' },
//     dot3: { animationDelay: '0.6s' },
//   };

//   return (
//     <div style={styles.container}>
//       <h1 style={styles.errorCode}>404</h1>
//       <p style={styles.errorMessage}>
//         Oops! The page you're looking for doesn't exist.
//       </p>
//       <div style={styles.animation}>
//         <span style={{ ...styles.dot, ...styles.dot1 }}></span>
//         <span style={{ ...styles.dot, ...styles.dot2 }}></span>
//         <span style={{ ...styles.dot, ...styles.dot3 }}></span>
//       </div>
//     </div>
//   );
// };

// export default NotFound;
