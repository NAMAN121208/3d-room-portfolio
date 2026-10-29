export const initialFocusState = Object.freeze({ status: 'exploring', objectId: null });

// Camera completion is explicit: panels never open halfway through a glide.
export function focusReducer(state, action) {
  switch (action.type) {
    case 'FOCUS':
      return state.status === 'exploring' && action.objectId
        ? { status: 'focusing', objectId: action.objectId } : state;
    case 'ARRIVED':
      return state.status === 'focusing' && action.objectId === state.objectId
        ? { ...state, status: 'focused' } : state;
    case 'CLOSE':
      return ['focusing', 'focused'].includes(state.status)
        ? { ...state, status: 'returning' } : state;
    case 'RETURNED':
      return state.status === 'returning' ? initialFocusState : state;
    default:
      return state;
  }
}
