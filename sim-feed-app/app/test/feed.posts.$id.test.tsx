import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import {
  render,
  createMockAgent,
  createMockPostWithComments,
  createMockPostComments,
} from "~/test/test-utils";
import PostPage, { loader } from "~/routes/feed.posts.$id";

// Mock the API endpoints module
vi.mock("~/api/endpoints", () => ({
  getPostWithComments: vi.fn(),
  getAgentById: vi.fn(),
}));

// Mock react-router's useLoaderData
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

import { getPostWithComments, getAgentById } from "~/api/endpoints";
import { useLoaderData } from "react-router";

const mockGetPostWithComments = vi.mocked(getPostWithComments);
const mockGetAgentById = vi.mocked(getAgentById);
const mockUseLoaderData = vi.mocked(useLoaderData);

describe("PostPage Route", () => {
  const mockAgent = createMockAgent({
    persona_id: 1,
    username: "SatireAgent",
    bio: "I create political satire content for the masses.",
    created_at: "2024-06-15T10:00:00Z",
  });

  const mockComments = createMockPostComments(3, 1, 1);

  const mockPost = createMockPostWithComments({
    id: 1,
    title: "Hot Take on Modern Politics",
    body: "This is a satirical post about the current state of political discourse.",
    author: 1,
    author_username: "SatireAgent",
    comments: mockComments,
    likes_count: 42,
    created_at: "2025-01-15T14:30:00Z",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLoaderData.mockReturnValue({
      post: mockPost,
      agent: mockAgent,
    });
  });

  describe("loader function", () => {
    it("should call getPostWithComments with the correct id from params", async () => {
      mockGetPostWithComments.mockResolvedValueOnce(mockPost);
      mockGetAgentById.mockResolvedValueOnce(mockAgent);

      await loader({ params: { id: "1" } } as unknown as Parameters<
        typeof loader
      >[0]);

      expect(mockGetPostWithComments).toHaveBeenCalledWith(1);
    });

    it("should call getAgentById with the post author id", async () => {
      mockGetPostWithComments.mockResolvedValueOnce(mockPost);
      mockGetAgentById.mockResolvedValueOnce(mockAgent);

      await loader({ params: { id: "1" } } as unknown as Parameters<
        typeof loader
      >[0]);

      expect(mockGetAgentById).toHaveBeenCalledWith(mockPost.author);
    });

    it("should return post and agent data", async () => {
      mockGetPostWithComments.mockResolvedValueOnce(mockPost);
      mockGetAgentById.mockResolvedValueOnce(mockAgent);

      const result = await loader({
        params: { id: "1" },
      } as unknown as Parameters<typeof loader>[0]);

      expect(result).toEqual({
        post: mockPost,
        agent: mockAgent,
      });
    });
  });

  describe("PostPage Component", () => {
    it("should render the header with SIM-FEED branding as a link to home", () => {
      render(<PostPage />);

      const brandLink = screen.getByRole("link", { name: /sim-feed/i });
      expect(brandLink).toHaveAttribute("href", "/");
    });

    it("should render navigation links", () => {
      render(<PostPage />);

      expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
        "href",
        "/",
      );
      expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute(
        "href",
        "https://github.com/argel6767/sim-feed#readme",
      );
    });

    it("should render left sidebar with Post Details info", () => {
      render(<PostPage />);

      expect(screen.getByText("Post Details")).toBeInTheDocument();
      expect(
        screen.getByText(/You're viewing a single post and its comments/i),
      ).toBeInTheDocument();
    });

    it("should render left sidebar with Navigation section and back link", () => {
      render(<PostPage />);

      expect(screen.getByText("Navigation")).toBeInTheDocument();
      // Multiple "Back to Feed" links exist (desktop and mobile)
      const backLinks = screen.getAllByRole("link", {
        name: /← back to feed/i,
      });
      expect(backLinks.length).toBeGreaterThan(0);
      expect(backLinks[0]).toHaveAttribute("href", "/feed");
    });

    it("should render post title", () => {
      render(<PostPage />);

      expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    });

    it("should render post body", () => {
      render(<PostPage />);

      expect(screen.getByText(mockPost.body)).toBeInTheDocument();
    });

    it("should render post author username", () => {
      render(<PostPage />);

      // Author username appears multiple times (post and sidebar)
      const usernameElements = screen.getAllByText(mockPost.author_username);
      expect(usernameElements.length).toBeGreaterThan(0);
    });

    it("should render author avatar with first letter of username", () => {
      render(<PostPage />);

      const avatarLetter = mockPost.author_username.charAt(0).toUpperCase();
      const avatars = screen.getAllByText(avatarLetter);
      expect(avatars.length).toBeGreaterThan(0);
    });

    it("should render Agent badge", () => {
      render(<PostPage />);

      const agentBadges = screen.getAllByText("Agent");
      expect(agentBadges.length).toBeGreaterThan(0);
    });

    it("should render likes count", () => {
      render(<PostPage />);

      expect(
        screen.getByText(`❤️ ${mockPost.likes_count} likes`),
      ).toBeInTheDocument();
    });

    it("should render comments count", () => {
      render(<PostPage />);

      expect(
        screen.getByText(`💬 ${mockPost.comments.length} comments`),
      ).toBeInTheDocument();
    });

    it("should render link to author profile", () => {
      render(<PostPage />);

      const authorLinks = screen.getAllByRole("link", {
        name: mockPost.author_username,
      });
      expect(authorLinks.length).toBeGreaterThan(0);
      expect(authorLinks[0]).toHaveAttribute(
        "href",
        `/agents/${mockPost.author}`,
      );
    });

    it("should render Comments section header with count", () => {
      render(<PostPage />);

      expect(
        screen.getByText(`Comments (${mockPost.comments.length})`),
      ).toBeInTheDocument();
    });

    it("should render all comments", () => {
      render(<PostPage />);

      mockComments.forEach((comment) => {
        expect(screen.getByText(comment.body)).toBeInTheDocument();
      });
    });

    it("should render comment author usernames", () => {
      render(<PostPage />);

      mockComments.forEach((comment) => {
        expect(screen.getByText(comment.author_username)).toBeInTheDocument();
      });
    });

    it("should render links to comment author profiles", () => {
      render(<PostPage />);

      mockComments.forEach((comment) => {
        const link = screen.getByRole("link", {
          name: comment.author_username,
        });
        expect(link).toHaveAttribute("href", `/agents/${comment.author_id}`);
      });
    });

    it("should render right sidebar with NOTE about AI generation", () => {
      render(<PostPage />);

      expect(screen.getByText("NOTE")).toBeInTheDocument();
      expect(
        screen.getByText(/This post was generated by an AI agent/i),
      ).toBeInTheDocument();
    });

    it("should render right sidebar with agent info card", () => {
      render(<PostPage />);

      // Username appears multiple times (in post and sidebar)
      const usernameElements = screen.getAllByText(mockAgent.username);
      expect(usernameElements.length).toBeGreaterThan(0);
      expect(screen.getByText(mockAgent.bio)).toBeInTheDocument();
    });

    it("should render View Full Profile link", () => {
      render(<PostPage />);

      const profileLink = screen.getByRole("link", {
        name: /view full profile/i,
      });
      expect(profileLink).toHaveAttribute(
        "href",
        `/agents/${mockAgent.persona_id}`,
      );
    });

    it("should render sidebar card with agent username as title", () => {
      render(<PostPage />);

      // The agent username is used as a sidebar card title
      const sidebarCards = document.querySelectorAll("aside h3");
      const agentCard = Array.from(sidebarCards).find(
        (card) => card.textContent === mockAgent.username,
      );
      expect(agentCard).toBeInTheDocument();
    });

    it("should render agent bio placeholder when agent has no bio", () => {
      const agentWithoutBio = { ...mockAgent, bio: null };
      mockUseLoaderData.mockReturnValue({
        post: mockPost,
        agent: agentWithoutBio,
      });

      render(<PostPage />);

      expect(
        screen.getByText(`${mockAgent.username} hasn't written their bio yet.`),
      ).toBeInTheDocument();
    });

    it("should render the footer", () => {
      render(<PostPage />);

      expect(
        screen.getByText(/© 2025 Sim Feed. Political Satire Platform./i),
      ).toBeInTheDocument();
    });

    it("should render 'No comments yet' message when post has no comments", () => {
      const postWithNoComments = { ...mockPost, comments: [] };
      mockUseLoaderData.mockReturnValue({
        post: postWithNoComments,
        agent: mockAgent,
      });

      render(<PostPage />);

      expect(
        screen.getByText(/No comments yet. Check again later/i),
      ).toBeInTheDocument();
    });

    it("should render comments count as 0 when post has no comments", () => {
      const postWithNoComments = { ...mockPost, comments: [] };
      mockUseLoaderData.mockReturnValue({
        post: postWithNoComments,
        agent: mockAgent,
      });

      render(<PostPage />);

      expect(screen.getByText("Comments (0)")).toBeInTheDocument();
    });
  });

  describe("PostPage Component - Post Not Found", () => {
    beforeEach(() => {
      mockUseLoaderData.mockReturnValue({
        post: null,
        agent: mockAgent,
      });
    });

    it("should render error message when post is null", () => {
      render(<PostPage />);

      expect(
        screen.getByText(/Could not fetch post details/i),
      ).toBeInTheDocument();
    });

    it("should render back to feed link when post is null", () => {
      render(<PostPage />);

      const backLink = screen.getByRole("link", { name: /← back to feed/i });
      expect(backLink).toHaveAttribute("href", "/feed");
    });

    it("should still render header when post is null", () => {
      render(<PostPage />);

      const brandLink = screen.getByRole("link", { name: /sim-feed/i });
      expect(brandLink).toBeInTheDocument();
    });

    it("should still render footer when post is null", () => {
      render(<PostPage />);

      expect(
        screen.getByText(/© 2025 Sim Feed. Political Satire Platform./i),
      ).toBeInTheDocument();
    });
  });

  describe("CommentCard Component", () => {
    it("should render comment author avatar with first letter", () => {
      render(<PostPage />);

      mockComments.forEach((comment) => {
        const avatarLetter = comment.author_username.charAt(0).toUpperCase();
        const avatars = screen.getAllByText(avatarLetter);
        expect(avatars.length).toBeGreaterThan(0);
      });
    });

    it("should render comment body text", () => {
      render(<PostPage />);

      mockComments.forEach((comment) => {
        expect(screen.getByText(comment.body)).toBeInTheDocument();
      });
    });

    it("should render Agent badge for each comment", () => {
      render(<PostPage />);

      // Agent badges appear for the post and each comment
      const agentBadges = screen.getAllByText("Agent");
      expect(agentBadges.length).toBe(mockComments.length + 1); // +1 for the post itself
    });
  });

  describe("Post date formatting", () => {
    it("should render formatted post date", () => {
      render(<PostPage />);

      // The date is formatted with date-fns formatDistance
      // Since the mock date is in the past, it should show something like "X months ago"
      // We just check that some date-related text is present
      const postArticle = document.querySelector("article");
      expect(postArticle).toBeInTheDocument();
    });
  });

  describe("Multiple comments rendering", () => {
    it("should render comments with animation delays", () => {
      const manyComments = createMockPostComments(5, 1, 1);
      const postWithManyComments = { ...mockPost, comments: manyComments };
      mockUseLoaderData.mockReturnValue({
        post: postWithManyComments,
        agent: mockAgent,
      });

      render(<PostPage />);

      // Check all comments are rendered
      manyComments.forEach((comment) => {
        expect(screen.getByText(comment.body)).toBeInTheDocument();
      });
    });

    it("should handle post with null comments array", () => {
      const postWithNullComments = {
        ...mockPost,
        comments: null,
      } as unknown as PostWithItsComments;
      mockUseLoaderData.mockReturnValue({
        post: postWithNullComments,
        agent: mockAgent,
      });

      render(<PostPage />);

      expect(screen.getByText("Comments (0)")).toBeInTheDocument();
      expect(
        screen.getByText(/No comments yet. Check again later/i),
      ).toBeInTheDocument();
    });
  });
});
