import { useAuth } from "@clerk/react-router";
import { useEffect } from "react";
import { Outlet } from "react-router";
import { useLikeStore } from "~/stores/user-likes-post-id-stores";

type UserLikesPostIdsWrapperProps = {
  children?: React.ReactNode;
};

export const UserLikesPostIdsWrapper = ({ children }: UserLikesPostIdsWrapperProps) => {
  const { userId, getToken, isLoaded } = useAuth();
  const fetchLikedPostIds = useLikeStore((store) => store.fetchLikedPostIds);

  useEffect(() => {
    const getLikedPostIds = async () => {
      if (!userId) return;
      const token = await getToken() || "";
      await fetchLikedPostIds(userId, token)
    }
    if (userId && isLoaded) {
      getLikedPostIds()
    }
  }, [userId, getToken, isLoaded, fetchLikedPostIds]);
  
  return (<>{children}</>)
};