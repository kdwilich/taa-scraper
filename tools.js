module.exports = function cleanInstagramURL(url) {
  // Use URL object to parse the URL
  const parsedUrl = new URL(url);

  // Extract the pathname
  const pathname = parsedUrl.pathname;

  // Match the required format "/p/{id}/"
  const match = pathname.match(/^\/p\/[^\/]+/);

  if (match) {
    // Return the cleaned URL with the trailing slash
    return `${parsedUrl.origin}${match[0]}/`;
  } else {
    throw new Error('Invalid Instagram URL format: ', url);
  }
}