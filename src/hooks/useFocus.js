import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { objects } from '../content';
import { focusReducer, initialFocusState } from './focusReducer';

const FocusContext = createContext(null);
const validIds = new Set(objects.map((object) => object.id));

export function FocusProvider({ children }) {
  const [state, dispatch] = useReducer(focusReducer, initialFocusState);
  const focus = useCallback((objectId) => {
    if (validIds.has(objectId)) dispatch({ type: 'FOCUS', objectId });
  }, []);
  const close = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  const arrived = useCallback((objectId) => dispatch({ type: 'ARRIVED', objectId }), []);
  const returned = useCallback(() => dispatch({ type: 'RETURNED' }), []);
  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);
  const value = useMemo(() => ({ ...state, focus, close, arrived, returned }), [state, focus, close, arrived, returned]);
  return createElement(FocusContext.Provider, { value }, children);
}

export function useFocus() {
  const value = useContext(FocusContext);
  if (!value) throw new Error('useFocus requires FocusProvider.');
  return value;
}
