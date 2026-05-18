const appReducer = (state, action) => {
  switch (action.type) {
    case 'GET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        loading: false
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    case 'DELETE_TRANSACTION':
      // Remove transaction from state; will trigger re-renders in Balance, IncomeExpenses, TransactionList
      return {
        ...state,
        transactions: state.transactions.filter(t => {
          const txId = String(t._id || t.id);
          const payloadId = String(action.payload);
          return txId !== payloadId;
        })
      };
    case 'TRANSACTION_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

export default appReducer;
