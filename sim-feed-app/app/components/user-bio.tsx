import { useAuth } from "@clerk/react-router";
import { useState } from "react";
import { useStatus } from "~/hooks/useStatus";
import { updateUserBio } from "~/api/user-api/users";
import { Error as ErrorDisplay } from "~/components/errors";
import { queryClient } from "~/root";
import type { UpdateUserBioDto } from "~/lib/user-api-dtos";

type UserBioProps = {
  bio: string;
  isOwnProfile: boolean;
  id: string;
};

export const UserBio = ({ bio, isOwnProfile, id }: UserBioProps) => {
  const { getToken } = useAuth();
  const { isLoading, isError, setLoading, setError, setIdle } = useStatus();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bio);
  const [optimisticBio, setOptimisticBio] = useState(bio);

  const handleSave = async () => {
    const previousBio = optimisticBio;
    const newBio = editText.trim();

    setOptimisticBio(newBio);
    setIsEditing(false);
    setLoading();

    try {
      const token = await getToken();
      if (!token) throw new globalThis.Error("No auth token available");

      const payload: UpdateUserBioDto = { newBio: newBio };
      await updateUserBio(id, token, payload);

      queryClient.setQueryData(["user-info", id], (old: any) =>
        old ? { ...old, bio: newBio } : old,
      );
      setIdle();
    } catch {
      setOptimisticBio(previousBio);
      setEditText(previousBio);
      setError();
    }
  };

  const handleCancel = () => {
    setEditText(optimisticBio);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (!isLoading) {
      setEditText(optimisticBio);
      setIsEditing(true);
    }
  };

  return (
    <section className="mb-4 sm:mb-6">
      <h2 className="text-md sm:text-lg uppercase tracking-[0.5px] text-sf-text-dim mb-2 sm:mb-3 font-semibold">
        Bio
      </h2>

      {isError ? (
        <ErrorDisplay
          message="Failed to update bio. Please try again."
          onRetry={() => {
            setIdle();
            handleEdit();
          }}
          onDismiss={() => setIdle()}
        />
      ) : isEditing ? (
        <>
          <textarea
            className="w-full bg-sf-bg-primary border border-sf-accent-primary rounded-lg p-3 text-sf-text-primary font-sans text-[0.85rem] sm:text-[0.95rem] leading-relaxed resize-none transition-colors duration-300 focus:outline-none focus:border-sf-accent-hover"
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={200}
            autoFocus
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sf-text-dim text-[0.75rem]">
              {editText.length}/300
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 border border-sf-border-subtle rounded text-[0.75rem] font-semibold uppercase tracking-[0.5px] bg-transparent text-sf-text-tertiary transition-all duration-300 hover:border-sf-text-secondary hover:text-sf-text-primary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 border border-sf-accent-primary rounded text-[0.75rem] font-semibold uppercase tracking-[0.5px] bg-sf-accent-primary text-sf-bg-primary transition-all duration-300 hover:bg-sf-accent-hover hover:border-sf-accent-hover cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </>
      ) : optimisticBio ? (
        <div
          className={`relative ${isOwnProfile ? "cursor-pointer" : ""}`}
          onMouseEnter={() => isOwnProfile && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => isOwnProfile && handleEdit()}
        >
          <p
            className={`text-sf-text-primary leading-relaxed text-[0.85rem] sm:text-[0.95rem] transition-opacity duration-200 ${
              isOwnProfile && (isHovered || isLoading)
                ? "opacity-40"
                : "opacity-100"
            }`}
          >
            {optimisticBio}
          </p>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sf-text-dim text-[0.8rem] italic tracking-wide">
                Saving…
              </span>
            </div>
          )}

          {!isLoading && isOwnProfile && isHovered && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sf-accent-primary text-[0.8rem] font-semibold uppercase tracking-[0.5px]">
                Update Bio
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`bg-sf-bg-card border rounded-lg p-3 sm:p-4 text-center transition-all duration-300 ${
            isOwnProfile
              ? "cursor-pointer border-sf-border-primary hover:border-sf-accent-primary hover:bg-sf-bg-card-hover"
              : "border-sf-border-primary"
          }`}
          onMouseEnter={() => isOwnProfile && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => isOwnProfile && handleEdit()}
        >
          {isLoading ? (
            <p className="text-sf-text-dim text-[0.8rem] sm:text-[0.9rem] italic">
              Saving…
            </p>
          ) : (
            <p className="text-sf-text-dim text-[0.8rem] sm:text-[0.9rem] italic">
              {isOwnProfile
                ? isHovered
                  ? "Update Bio"
                  : "You haven't written a bio yet. Hover to add one!"
                : "This user hasn't written their bio yet."}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
