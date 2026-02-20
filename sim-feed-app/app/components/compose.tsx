import { useAuth, useUser } from '@clerk/react-router';
import { useState } from 'react';
import { PostFeedSkeleton } from './posts';
import { Link } from 'react-router';
import { createPost } from '~/api/user-api/posts';
import { useStatus } from '~/hooks/useStatus';
import {Error} from './errors';
import type { NewPostDto } from '~/lib/user-api-dtos';
import {queryClient} from '~/root';

export const Compose = () => {
  const [composeText, setComposeText] = useState("");
  const [title, setTitle] = useState("");
  const { user, isLoaded } = useUser();
  const { isLoading, isError, setLoading, setError, setIdle } = useStatus();
  const { getToken } = useAuth();
  
  const clearFields = () => {
    setComposeText("");
    setTitle("");
  };
  
  const createNewPost = async () => {
    const token = await getToken();
    if (!token) {
      setError();
      return;
    }
    const body: NewPostDto = {
      title: title,
      body: composeText
    }
    
    try {
      await createPost(body, token);
      clearFields();
      queryClient.refetchQueries({ queryKey: ['posts'] })
    } catch (error) {
      setError();
    }
  }
  
  if (!isLoaded || isLoading) return <PostFeedSkeleton count={1} />;
  
  if (isError) {
    return (
       <Error 
         message="Failed to create post. Please try again."
         onRetry={() => {
           setIdle(); // Reset the error
           // retry your post creation logic
         }}
         onDismiss={() => setIdle()}
       />
     );
  }
  
  return (
    <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-6 mb-4 motion-preset-fade motion-delay-100 max-h-90">
      <div className="flex items-center gap-4 mb-4">
        {
          user?.hasImage ? (
            <img className="w-10 h-10 rounded-full" src={user.imageUrl} alt={user.username|| "user profile picture"}/>
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary text-[0.9rem]">
              YOU
            </div>
          )
        }
        <div>
          <div className="font-semibold text-[0.95rem] text-sf-text-primary">
            You
          </div>
          <Link className="text-sf-text-dim text-[0.85rem]" to={`/users/${user?.id}`}>
            @{user?.username}
          </Link>
        </div>
      </div>
      <input type='text' className='w-full bg-sf-bg-primary border border-sf-border-primary rounded p-4 text-sf-text-primary font-sans text-[1rem] resize-none transition-colors duration-300 focus:outline-none focus:border-sf-accent-primary mb-2'
      placeholder='Title your post' maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)}/>
      <textarea
        className="w-full bg-sf-bg-primary border border-sf-border-primary rounded p-4 text-sf-text-primary font-sans text-[1rem] resize-none transition-colors duration-300 focus:outline-none focus:border-sf-accent-primary"
        placeholder="What's on your mind?"
        rows={3}
        value={composeText}
        onChange={(e) => setComposeText(e.target.value)}
        maxLength={1000}
      />
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-5 py-2.5 border border-sf-border-subtle rounded text-[0.85rem] font-semibold uppercase tracking-[0.5px] bg-transparent text-sf-text-tertiary transition-all duration-300 hover:border-sf-text-secondary hover:text-sf-text-primary cursor-pointer"
          onClick={clearFields}
        >
          Cancel
        </button>
        <button onClick={createNewPost} className="px-5 py-2.5 border border-sf-accent-primary rounded text-[0.85rem] font-semibold uppercase tracking-[0.5px] bg-sf-accent-primary text-sf-bg-primary transition-all duration-300 hover:bg-sf-accent-hover hover:border-sf-accent-hover cursor-pointer">
          Post
        </button>
      </div>
    </div>
  )
}