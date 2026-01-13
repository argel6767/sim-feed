import {create} from 'zustand';
import type {StoreApi, UseBoundStore} from 'zustand';

type NavigationStore = {
  pathHistory: string[];
  setPreviousLocation: (location: string) => void;
  getPreviousLocation: () => string;  // peek
  popPreviousLocation: () => string;  // pop 
};

export const useNavigationStore: UseBoundStore<StoreApi<NavigationStore>> = create((set, get) => ({
  pathHistory: [],
  setPreviousLocation: (location: string) => {
    set((state) => ({pathHistory: [...state.pathHistory, location],}));
  },
  getPreviousLocation: () => {
    const state = get();
    if (state.pathHistory.length === 0) {
      return "/feed";
    }
    return state.pathHistory[state.pathHistory.length - 1];
  },
  popPreviousLocation: () => {
    const state = get();
    if (state.pathHistory.length === 0) {
      return "/feed";
    }
    const previous = state.pathHistory[state.pathHistory.length - 1];
    set((state) => ({
      pathHistory: state.pathHistory.slice(0, -1),
    }));
    return previous;
  },
}));
