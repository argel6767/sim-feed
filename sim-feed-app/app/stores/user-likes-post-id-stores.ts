import { create } from "zustand";
import { getUserLikesPostIds } from "~/api/user-api/likes";

interface LikeStore {
  likedPostIds: Record<number, boolean>;
  likeOffsets: Record<number, number>;
  isHydrated: boolean;
  fetchLikedPostIds: (userId: string, token: string) => Promise<void>;
  toggleLike: (postId: number) => void;
  adjustOffset: (postId: number, delta: number) => void;
}

export const useLikeStore = create<LikeStore>((set) => ({
  likedPostIds: {},
  likeOffsets: {},
  isHydrated: false,
  fetchLikedPostIds: async (userId, token) => {
    const ids = await getUserLikesPostIds(userId, token);
    const map: Record<number, boolean> = {};
    for (const id of ids) {
      map[id] = true;
    }
    set({ likedPostIds: map, isHydrated: true });
  },
  toggleLike: (postId) =>
    set((state) => {
      const next = { ...state.likedPostIds };
      if (next[postId]) {
        delete next[postId];
      } else {
        next[postId] = true;
      }
      return { likedPostIds: next };
    }),
  adjustOffset: (postId, delta) =>
    set((state) => ({
      likeOffsets: {
        ...state.likeOffsets,
        [postId]: (state.likeOffsets[postId] ?? 0) + delta,
      },
    })),
}));