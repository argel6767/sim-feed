CREATE TABLE IF NOT EXISTS personas (
    persona_id BIGSERIAL PRIMARY KEY,
    bio TEXT NOT NULL,
    description TEXT,
    username VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    bio VARCHAR(250),
    image_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    author BIGINT,
    user_author VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (author) REFERENCES personas(persona_id),
    FOREIGN KEY (user_author) REFERENCES users(id),
    CHECK (
        (author IS NOT NULL AND user_author IS NULL)
        OR (author IS NULL AND user_author IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    body TEXT NOT NULL,
    author_id BIGINT,
    user_author_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (author_id) REFERENCES personas(persona_id),
    FOREIGN KEY (user_author_id) REFERENCES users(id),
    CHECK (
        (author_id IS NOT NULL AND user_author_id IS NULL)
        OR (author_id IS NULL AND user_author_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    persona_id BIGINT,
    user_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (persona_id) REFERENCES personas(persona_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uq_likes_post_persona UNIQUE (post_id, persona_id),
    CONSTRAINT uq_likes_post_user UNIQUE (post_id, user_id),
    CHECK (
        (persona_id IS NOT NULL AND user_id IS NULL)
        OR (persona_id IS NULL AND user_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS follows (
    id BIGSERIAL PRIMARY KEY,
    follower BIGINT NOT NULL,
    followed BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (follower) REFERENCES personas(persona_id),
    FOREIGN KEY (followed) REFERENCES personas(persona_id),
    UNIQUE (follower, followed)
);

CREATE TABLE IF NOT EXISTS user_follows (
    id BIGSERIAL PRIMARY KEY,
    follower VARCHAR(255) NOT NULL,
    persona_followed BIGINT,
    user_followed VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (follower) REFERENCES users(id),
    FOREIGN KEY (persona_followed) REFERENCES personas(persona_id),
    FOREIGN KEY (user_followed) REFERENCES users(id),
    UNIQUE (follower, persona_followed),
    UNIQUE (follower, user_followed),
    CHECK (
        (persona_followed IS NOT NULL AND user_followed IS NULL)
        OR (persona_followed IS NULL AND user_followed IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS admin (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_invitations (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 day',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chats (
    id BIGSERIAL PRIMARY KEY,
    chat_name VARCHAR(255) NOT NULL,
    creator_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_members (
    id BIGSERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id VARCHAR(255),
    persona_id BIGINT,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (chat_id) REFERENCES chats(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (persona_id) REFERENCES personas(persona_id),
    UNIQUE (chat_id, user_id),
    CHECK (
        (user_id IS NOT NULL AND persona_id IS NULL)
        OR (user_id IS NULL AND persona_id IS NOT NULL)
    )
);

CREATE TYPE agent_event_type AS ENUM (
    'CREATE_POST',
    'LIKE_POST',
    'COMMENT',
    'FOLLOW',
    'UPDATE_BIO'
);

CREATE TABLE IF NOT EXISTS agent_events (
    id BIGSERIAL PRIMARY KEY,
    persona_id BIGINT NOT NULL REFERENCES personas(persona_id),
    event_type VARCHAR(31) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_event_post (
    event_id BIGINT PRIMARY KEY REFERENCES agent_events(id),
    post_id BIGINT NOT NULL UNIQUE REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS agent_event_like (
    event_id BIGINT PRIMARY KEY REFERENCES agent_events(id),
    like_id BIGINT NOT NULL UNIQUE REFERENCES likes(id)
);

CREATE TABLE IF NOT EXISTS agent_event_comment (
    event_id BIGINT PRIMARY KEY REFERENCES agent_events(id),
    post_id BIGINT NOT NULL REFERENCES posts(id),
    comment_id BIGINT NOT NULL UNIQUE REFERENCES comments(id)
);

CREATE TABLE IF NOT EXISTS agent_event_follow (
    event_id BIGINT PRIMARY KEY REFERENCES agent_events(id),
    followed_id BIGINT NOT NULL REFERENCES personas(persona_id)
);

CREATE TABLE IF NOT EXISTS agent_event_bio (
    event_id BIGINT PRIMARY KEY REFERENCES agent_events(id),
    bio TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_user_author ON posts(user_author);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_author_id ON comments(user_author_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_persona_id ON likes(persona_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower);
CREATE INDEX IF NOT EXISTS idx_user_follows_persona_followed ON user_follows(persona_followed);
CREATE INDEX IF NOT EXISTS idx_user_follows_user_followed ON user_follows(user_followed);
CREATE INDEX IF NOT EXISTS idx_chats_creator_id ON chats(creator_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_room_user ON chat_members(chat_id, user_id);
-- agent_events indexes
CREATE INDEX IF NOT EXISTS idx_agent_events_persona_id ON agent_events(persona_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_event_type ON agent_events(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_events_created_at ON agent_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_events_persona_event ON agent_events(persona_id, event_type);

-- agent_event_post indexes
CREATE INDEX IF NOT EXISTS idx_agent_event_post_post_id ON agent_event_post(post_id);

-- agent_event_like indexes
CREATE INDEX IF NOT EXISTS idx_agent_event_like_like_id ON agent_event_like(like_id);

-- agent_event_comment indexes
CREATE INDEX IF NOT EXISTS idx_agent_event_comment_post_id ON agent_event_comment(post_id);
CREATE INDEX IF NOT EXISTS idx_agent_event_comment_comment_id ON agent_event_comment(comment_id);

-- agent_event_follow indexes
CREATE INDEX IF NOT EXISTS idx_agent_event_follow_followed_id ON agent_event_follow(followed_id);