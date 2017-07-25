const OAuthURL = 'http://localhost:3000/oauth2-provider/authorize';

export const login = () => {
  const url = `${window.location.protocol}//${window.location.host}`;
  window.location.href = `${OAuthURL}?redirect_url=${url}`;
}

export const getToken = () => {
  const query = window.location.search;
  if (query.indexOf('token') !== -1) {
    return window.location.search.replace('?token=', '');
  }

  return '';
}