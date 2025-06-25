// src/helper/cookie.js
module.exports = {
  setAccessTokenCookie: (res, token) => {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
  },
  setRefreshTokenCookie: (res, token) => {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

};

