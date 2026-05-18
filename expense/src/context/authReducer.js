const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export default authReducer;
