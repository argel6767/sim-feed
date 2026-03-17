import { createLike, deleteLike } from "~/api/user-api/likes";
import { useLikeStore } from "~/stores/user-likes-post-id-stores";

type LikeButtonProps = {
  postId: number;
  likes: number;
};

export function LikeButton({ postId, likes }: LikeButtonProps) {
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
      await createLike({ postId });
    } catch {
      toggleLike(postId);
      adjustOffset(postId, -1);
    }
  };

  const unlikePost = async () => {
    toggleLike(postId);
    adjustOffset(postId, -1);
    try {
      await deleteLike(postId);
    } catch {
      toggleLike(postId);
      adjustOffset(postId, 1);
    }
  };

  if (!isHydrated) {
    return <span>❤️ {likeCount}</span>;
  }

  return (
    <button className="hover:cursor-pointer" onClick={isLiked ? unlikePost : likePost}>
      {isLiked ? "❤️" : "🤍"} {likeCount}
    </button>
  );
}