import { createLike, deleteLike } from "~/api/user-api/likes";
import { useLikeStore } from "~/stores/user-likes-post-id-stores";
import { useAuth } from "@clerk/react-router";

type LikeButtonProps = {
  postId: number;
  likes: number;
};

export function LikeButton({ postId, likes }: LikeButtonProps) {
  const { getToken, userId } = useAuth();
  const isHydrated = useLikeStore((state) => state.isHydrated);
  const isLiked = useLikeStore((state) => !!state.likedPostIds[postId]);
  const likeCountOffset = useLikeStore((state) => state.likeOffsets[postId] ?? 0);
  const toggleLike = useLikeStore((state) => state.toggleLike);
  const adjustOffset = useLikeStore((state) => state.adjustOffset);

  const likeCount = likes + likeCountOffset;

  const likePost = async () => {
    toggleLike(postId);
    adjustOffset(postId, 1);
    try {
      const token = await getToken();
      await createLike({ postId }, token!);
    } catch {
      toggleLike(postId);
      adjustOffset(postId, -1);
    }
  };

  const unlikePost = async () => {
    toggleLike(postId);
    adjustOffset(postId, -1);
    try {
      const token = await getToken();
      await deleteLike(postId, token!);
    } catch {
      toggleLike(postId);
      adjustOffset(postId, 1);
    }
  };

  if (!isHydrated || !userId) {
    return <span>❤️ {likeCount}</span>;
  }

  return (
    <button className="hover:cursor-pointer" onClick={isLiked ? unlikePost : likePost}>
      {isLiked ? "❤️" : "🤍"} {likeCount}
    </button>
  );
}