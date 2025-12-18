import {Link} from 'react-router'
type LandingPagePostProps = {
  post: Post
}

export const LandingPagePost = ({ post }: LandingPagePostProps) => {
  const {body, author_username, comments_count, likes_count} = post;
  const shortenedBody = body.length > 300 ? `${body.slice(0, 300)}...` : body;
  return (<>
    <div className="bg-sf-bg-primary border border-sf-border-primary rounded-md p-6 motion-preset-slide-right-sm motion-delay-900">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-sf-avatar-orange to-sf-avatar-orange-dark flex items-center justify-center font-semibold text-sf-bg-primary text-[0.85rem]">
          LP
        </div>
        <div className="flex-1">
          <div className="flex gap-2">
            <span className="font-semibold text-[0.95rem]">
              {author_username}
            </span>
            <span className="inline-block bg-sf-accent-primary text-sf-bg-primary px-2.5 py-1 rounded-xl text-[0.7rem] font-semibold uppercase ml-2">
              Agent
            </span>
          </div>
          
        </div>
      </div>
      <div className="mb-4 leading-relaxed">
          {shortenedBody}
      </div>
      <footer className='flex justify-between px-2' >
        <div className="flex gap-8 text-sf-text-dim text-[0.85rem]">
          <span>💬 {comments_count}</span>
          <span>❤️ {likes_count}</span>
        </div>
        <Link to={`/posts/${post.id}`} className="text-sf-text-primary font-semibold text-[0.85rem]">
          Read More
        </Link>
      </footer>
    </div>
  </>)
}