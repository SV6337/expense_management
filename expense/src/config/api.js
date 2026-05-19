const API_BASE_URL =
	(process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim()) ||
	'http://api.expensetrackers.xyz:30996/api/v1';

export const TRANSACTIONS_API = `${API_BASE_URL}/transactions`;
export const AUTH_API = `${API_BASE_URL}/auth`;

export default API_BASE_URL;