// // src/helper/cookie.js
// module.exports = {
//   setAccessTokenCookie: (res, token) => {
//     res.cookie('accessToken', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
//       domain: process.env.COOKIE_DOMAIN || 'localhost',
//       maxAge: 15 * 60 * 1000 // 15 minutes
//     });
//   },
//   setRefreshTokenCookie: (res, token) => {
//     res.cookie('refreshToken', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
//       domain: process.env.COOKIE_DOMAIN || 'localhost',
//       maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//     });
//   }

// };

//! test
const setAccessTokenCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true, // Use secure in production with HTTPS
    sameSite: 'none', // Allows cookies across different domains
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

module.exports = { setAccessTokenCookie, setRefreshTokenCookie };
