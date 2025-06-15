module.exports = function formatResponse(success, data = null, message = '') {
  return {
    success,
    ...(message && { message }),
    ...(data && { data })
  };
};