export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    if (!payload.exp) return true; // Ensure the token has an expiration field
    return (payload.exp * 1000) < Date.now(); // Check if the token is expired
  } catch (error) {
    console.error("Token parsing failed:", error);
    return true;
  }
};