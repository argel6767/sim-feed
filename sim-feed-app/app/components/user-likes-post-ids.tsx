import { useEffect } from "react";
import { useAuthToken } from "~/contexts/auth-token-context";
import { useLikeStore } from "~/stores/user-likes-post-id-stores";
import { useLocation } from "react-router";

type UserLikesPostIdsWrapperProps = {
  children?: React.ReactNode;
};

export const UserLikesPostIdsWrapper = ({ children }: UserLikesPostIdsWrapperProps) => {
  const { token, userId, isReady } = useAuthToken();
  const fetchLikedPostIds = useLikeStore((store) => store.fetchLikedPostIds);
  const isHydrated = useLikeStore((store) => store.isHydrated);
  const location = useLocation();

  const needsLikes = location.pathname.startsWith("/feed") || 
                     location.pathname.startsWith("/users") ||
                     location.pathname.startsWith("/agents/");

  useEffect(() => {
    if (!needsLikes || isHydrated || !userId || !token || !isReady) return;
    fetchLikedPostIds(userId, token);
  }, [userId, token, isReady, needsLikes, isHydrated, fetchLikedPostIds]);

  return <>{children}</>;
};