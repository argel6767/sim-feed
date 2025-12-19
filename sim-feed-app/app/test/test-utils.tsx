import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

type AllTheProvidersProps = {
  children: React.ReactNode;
  initialEntries?: string[];
};

function AllTheProviders({
  children,
  initialEntries = ["/"],
}: AllTheProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

type CustomRenderOptions = Omit<RenderOptions, "wrapper"> & {
  initialEntries?: string[];
};

function customRender(
  ui: ReactElement,
  { initialEntries, ...options }: CustomRenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialEntries={initialEntries}>
        {children}
      </AllTheProviders>
    ),
    ...options,
  });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

// Override render with our custom render
export { customRender as render };

// Export query client creator for tests that need direct access
export { createTestQueryClient };

// Mock data factories
export const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  title: "Test Post Title",
  body: "This is a test post body with some political satire content.",
  author: 1,
  author_username: "TestAgent",
  comments_count: 5,
  likes_count: 10,
  created_at: "2025-01-01T00:00:00Z",
  ...overrides,
});

export const createMockPosts = (count: number, startId: number = 1): Post[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockPost({
      id: startId + index,
      title: `Test Post Title ${startId + index}`,
      author_username: `Agent${startId + index}`,
      body: `Test post content number ${startId + index}. This is political satire.`,
      comments_count: Math.floor(Math.random() * 20),
      likes_count: Math.floor(Math.random() * 100),
    }),
  );
};

export const createMockActiveAgent = (
  overrides: Partial<{
    persona_id: string;
    username: string;
    post_count: number;
  }> = {},
) => ({
  persona_id: "1",
  username: "ActiveAgent",
  post_count: 25,
  ...overrides,
});

export const createMockPopularPost = (
  overrides: Partial<{
    id: string;
    title: string;
    like_count: number;
  }> = {},
) => ({
  id: "1",
  title: "Popular Post Title",
  like_count: 100,
  ...overrides,
});

// Mock Agent factory
export const createMockAgent = (overrides: Partial<Agent> = {}): Agent => ({
  persona_id: 1,
  bio: "This is a test agent bio with political satire content.",
  username: "TestAgent",
  created_at: "2025-01-01T00:00:00Z",
  ...overrides,
});

// Mock PersonaRelation factory
export const createMockPersonaRelation = (
  overrides: Partial<{
    persona_id: string;
    username: string;
  }> = {},
) => ({
  persona_id: "1",
  username: "RelatedAgent",
  ...overrides,
});

// Mock PersonaRelations array factory
export const createMockPersonaRelations = (
  count: number,
  startId: number = 1,
) => {
  return Array.from({ length: count }, (_, index) =>
    createMockPersonaRelation({
      persona_id: String(startId + index),
      username: `Agent${startId + index}`,
    }),
  );
};

// Mock PostComment factory
export const createMockPostComment = (
  overrides: Partial<PostComment> = {},
): PostComment => ({
  id: 1,
  post_id: 1,
  body: "This is a test comment on the post.",
  author_id: 1,
  author_username: "CommentAgent",
  created_at: "2025-01-01T00:00:00Z",
  ...overrides,
});

// Mock PostComments array factory
export const createMockPostComments = (
  count: number,
  postId: number = 1,
  startId: number = 1,
): PostComment[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockPostComment({
      id: startId + index,
      post_id: postId,
      author_id: startId + index,
      author_username: `CommentAgent${startId + index}`,
      body: `Test comment number ${startId + index} on this post.`,
    }),
  );
};

// Mock PostWithItsComments factory
export const createMockPostWithComments = (
  overrides: Partial<PostWithItsComments> = {},
): PostWithItsComments => ({
  id: 1,
  title: "Test Post Title",
  body: "This is a test post body with some political satire content.",
  author: 1,
  author_username: "TestAgent",
  comments: [],
  likes_count: 10,
  created_at: "2025-01-01T00:00:00Z",
  ...overrides,
});
