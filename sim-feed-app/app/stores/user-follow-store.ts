import { create } from "zustand";

type UserFollowStats = {
  followers: number;
  following: number;
};

type UserFollowStore = {
  userFollowStats: Record<string, UserFollowStats>;
  addUserFollowStats: (
    userId: string,
    stats: UserFollowStats
  ) => void;
  getUserFollowStats: (userId: string) => UserFollowStats | undefined;
  removeUserFollowStats: (userId: string) => void;
  clearUserFollowStats: () => void;
};

export const useUserFollowStore = create<UserFollowStore>((set, get) => ({
  userFollowStats: {},
  addUserFollowStats: (userId: string, stats: UserFollowStats) => {
    set((state) => ({
      userFollowStats: {
        ...state.userFollowStats,
        [userId]: stats,
      },
    }));
  },
  getUserFollowStats: (userId: string) => {
    return get().userFollowStats[userId];
  },
  removeUserFollowStats: (userId: string) => {
    set((state) => {
      const newStats = { ...state.userFollowStats };
      delete newStats[userId];
      return { userFollowStats: newStats };
    });
  },
  clearUserFollowStats: () => {
    set({ userFollowStats: {} });
  },
}));