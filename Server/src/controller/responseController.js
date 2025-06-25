const successResponse = (
  res,
  { statusCode = 200, message = 'Success', payload = {}, metadata = {} }
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    payload,
    ...metadata,
  });
};

const errorResponse = (
  res,
  { statusCode = 400, message = 'Error', errors = null, code = null }
) => {
  const response = {
    success: false,
    message,
    ...(code && { code }),
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse };
