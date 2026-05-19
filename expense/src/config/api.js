const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://65.2.46.169:30996/api/v1';

export const TRANSACTIONS_API = `${API_BASE_URL}/transactions`;
export const AUTH_API = `${API_BASE_URL}/auth`;

export default API_BASE_URL;