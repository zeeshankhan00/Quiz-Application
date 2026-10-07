export function clearSession() {
  localStorage.removeItem('jwt');
  sessionStorage.removeItem('loginIntent');
}

// Decoding is for display/expiry only. Backend /auth/me confirms identity and role.
export function getStoredUser() {
  const token = localStorage.getItem('jwt');
  if (!token) return null;
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(padded), char => char.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof claims.sub !== 'string' || !claims.sub || typeof claims.exp !== 'number'
        || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) throw new Error('Invalid session');
    return { email: claims.sub, name: claims.name || claims.sub, exp: claims.exp };
  } catch {
    clearSession();
    return null;
  }
}

// Called once in main.jsx before React mounts (including in development StrictMode).
export function consumeOAuthRedirect() {
  if (window.location.pathname !== '/oauth2/redirect') return null;
  const query = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const token = fragment.get('token') || query.get('token');
  const error = query.get('error');
  window.history.replaceState({}, '', '/');
  if (error || !token) {
    clearSession();
    return error === 'unverified_email'
      ? 'A verified Google email is required to sign in.'
      : 'Google sign-in failed. Please try again.';
  }
  localStorage.setItem('jwt', token);
  if (!getStoredUser()) return 'Your sign-in session is invalid or expired. Please try again.';
  return null;
}

export function beginGoogleLogin(baseUrl, intent) {
  clearSession();
  sessionStorage.setItem('loginIntent', intent === 'admin' ? 'admin' : 'user');
  window.location.assign(`${baseUrl}/oauth2/authorization/google`);
}
