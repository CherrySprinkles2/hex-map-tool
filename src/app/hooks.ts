import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = (): AppDispatch => {
  return useDispatch<AppDispatch>();
};

export const useAppSelector: <T>(
  selector: (state: RootState) => T,
  equalityFn?: (left: T, right: T) => boolean
) => T = useSelector;

export const useAppStore = (): ReturnType<typeof useStore<RootState>> => {
  return useStore<RootState>();
};
