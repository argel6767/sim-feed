import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import {
  render,
  createMockActiveAgent,
  createMockPopularPost,
} from "~/test/test-utils";
import Feed, { loader, meta } from '~/routes/feed';

// Mock the API endpoints module
vi.mock("~/api/endpoints", () => ({
  getMostLikedPosts: vi.fn(),
  getMostActiveAgents: vi.fn(),
  getPosts: vi.fn(),
}));

// Mock react-router's useLoaderData
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

// Mock the useGetPosts hook used by PostFeed component
vi.mock("~/hooks/useGetPosts", () => ({
  useGetPosts: vi.fn(() => ({
    data: { pages: [] },
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  })),
}));

import { getMostLikedPosts, getMostActiveAgents } from "~/api/endpoints";
import { useLoaderData } from "react-router";
import { useGetPosts } from "~/hooks/useGetPosts";
import type { ActiveAgent, PopularPost } from "~/lib/dtos";

const mockGetMostLikedPosts = vi.mocked(getMostLikedPosts);
const mockGetMostActiveAgents = vi.mocked(getMostActiveAgents);
const mockUseLoaderData = vi.mocked(useLoaderData);
const mockUseGetPosts = vi.mocked(useGetPosts);

describe("Feed Route", () => {
  const mockActiveAgents: ActiveAgent[] = [
    createMockActiveAgent({
      persona_id: "1",
      username: "LeftyLarry",
      post_count: 50,
    }),
    createMockActiveAgent({
      persona_id: "2",
      username: "RightyRick",
      post_count: 45,
    }),
    createMockActiveAgent({
      persona_id: "3",
      username: "CentristCarl",
      post_count: 30,
    }),
  ];

  const mockPopularPosts: PopularPost[] = [
    createMockPopularPost({
      id: "1",
      title: "Hot Take on Politics",
      like_count: 200,
    }),
    createMockPopularPost({
      id: "2",
      title: "Another Viral Post",
      like_count: 150,
    }),
    createMockPopularPost({
      id: "3",
      title: "Satirical Commentary",
      like_count: 100,
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLoaderData.mockReturnValue({
      mostLikedPosts: mockPopularPosts,
      mostActiveAgents: mockActiveAgents,
    });
    mockUseGetPosts.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
    }as unknown as ReturnType<typeof useGetPosts>);
  });

  describe("meta function", () => {
    it("should return correct meta tags", () => {
      const result = meta({} as Parameters<typeof meta>[0]);

      expect(result).toEqual([
        { title: "Feed - Sim Feed" },
        {
          name: "description",
          content:
            "Experience a social feed where AI agents embody exaggerated political personas and engage in satirical debate.",
        },
      ]);
    });
  });

  describe("loader function", () => {
    it("should call getMostLikedPosts with 5 and getMostActiveAgents with 5", async () => {
      mockGetMostLikedPosts.mockResolvedValueOnce(mockPopularPosts);
      mockGetMostActiveAgents.mockResolvedValueOnce(mockActiveAgents);

      const result = await loader();

      expect(mockGetMostLikedPosts).toHaveBeenCalledWith(5);
      expect(mockGetMostActiveAgents).toHaveBeenCalledWith(5);
      expect(result).toEqual({
        mostLikedPosts: mockPopularPosts,
        mostActiveAgents: mockActiveAgents,
      });
    });

    it("should fetch both API calls in parallel using Promise.all", async () => {
      let likedPostsResolved = false;
      let activeAgentsResolved = false;

      mockGetMostLikedPosts.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        likedPostsResolved = true;
        return mockPopularPosts;
      });

      mockGetMostActiveAgents.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        activeAgentsResolved = true;
        return mockActiveAgents;
      });

      await loader();

      // Both should be resolved since Promise.all runs them in parallel
      expect(likedPostsResolved).toBe(true);
      expect(activeAgentsResolved).toBe(true);
    });

    it("should handle API errors gracefully", async () => {
      mockGetMostLikedPosts.mockResolvedValueOnce([]);
      mockGetMostActiveAgents.mockResolvedValueOnce([]);

      const result = await loader();

      expect(result).toEqual({
        mostLikedPosts: [],
        mostActiveAgents: [],
      });
    });
  });

  describe("Feed Component", () => {
    it("should render the header with SIM FEED branding as a link to home", () => {
      render(<Feed />);

      const brandLink = screen.getByRole("link", { name: /sim feed/i });
      expect(brandLink).toHaveAttribute("href", "/");
    });

    it("should render navigation links", () => {
      render(<Feed />);

      expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
        "href",
        "/",
      );
      expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute(
        "href",
        "https://github.com/argel6767/sim-feed#readme",
      );
    });

    it("should render left sidebar with Welcome section", () => {
      render(<Feed />);

      expect(screen.getByText("Welcome")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Experience a social feed where AI agents embody exaggerated political personas/i,
        ),
      ).toBeInTheDocument();
    });

    it("should render left sidebar with How It Works section", () => {
      render(<Feed />);

      expect(screen.getByText("How It Works")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Agents generate posts and comments based on their assigned ideology/i,
        ),
      ).toBeInTheDocument();
    });

    it("should render right sidebar with Most Active Agents section", () => {
      render(<Feed />);

      expect(screen.getByText("Most Active Agents")).toBeInTheDocument();
    });

    it("should render most active agents from loader data", () => {
      render(<Feed />);

      mockActiveAgents.forEach((agent) => {
        // CardItem formats label as @ + username with second char uppercased
        const formattedLabel = `@${agent.username.charAt(0).toUpperCase()}${agent.username.slice(1)}`;
        expect(screen.getByText(formattedLabel)).toBeInTheDocument();
      });
    });

    it("should render agent post counts", () => {
      render(<Feed />);

      mockActiveAgents.forEach((agent) => {
        // The component renders with two spaces between emoji and count
        expect(
          screen.getByText(
            (content) =>
              content.includes(`📝`) && content.includes(`${agent.post_count}`),
          ),
        ).toBeInTheDocument();
      });
    });

    it("should render links to agent profiles", () => {
      render(<Feed />);

      mockActiveAgents.forEach((agent) => {
        const formattedLabel = `@${agent.username.charAt(0).toUpperCase()}${agent.username.slice(1)}`;
        const link = screen.getByRole("link", { name: formattedLabel });
        expect(link).toHaveAttribute("href", `/agents/${agent.persona_id}`);
      });
    });

    it("should render right sidebar with Most Trending Posts section", () => {
      render(<Feed />);

      expect(screen.getByText("Most Trending Posts")).toBeInTheDocument();
    });

    it("should render most liked posts from loader data", () => {
      render(<Feed />);

      mockPopularPosts.forEach((post) => {
        // CardItem formats label as # + title with second char uppercased
        const formattedLabel = `#${post.title.charAt(0).toUpperCase()}${post.title.slice(1)}`;
        expect(screen.getByText(formattedLabel)).toBeInTheDocument();
      });
    });

    it("should render post like counts", () => {
      render(<Feed />);

      mockPopularPosts.forEach((post) => {
        // The component renders with two spaces between emoji and count
        expect(
          screen.getByText(
            (content) =>
              content.includes(`❤️`) && content.includes(`${post.like_count}`),
          ),
        ).toBeInTheDocument();
      });
    });

    it("should render links to post details", () => {
      render(<Feed />);

      mockPopularPosts.forEach((post) => {
        const formattedLabel = `#${post.title.charAt(0).toUpperCase()}${post.title.slice(1)}`;
        const link = screen.getByRole("link", { name: formattedLabel });
        expect(link).toHaveAttribute("href", `/posts/${post.id}`);
      });
    });

    it("should render the footer", () => {
      render(<Feed />);

      expect(
        screen.getByText(/© 2025 Sim Feed. Political Satire Platform./i),
      ).toBeInTheDocument();
    });

    it("should handle empty most active agents array", () => {
      mockUseLoaderData.mockReturnValue({
        mostLikedPosts: mockPopularPosts,
        mostActiveAgents: [],
      });

      render(<Feed />);

      // Section should still render
      expect(screen.getByText("Most Active Agents")).toBeInTheDocument();
    });

    it("should handle empty most liked posts array", () => {
      mockUseLoaderData.mockReturnValue({
        mostLikedPosts: [],
        mostActiveAgents: mockActiveAgents,
      });

      render(<Feed />);

      // Section should still render
      expect(screen.getByText("Most Trending Posts")).toBeInTheDocument();
    });

    it("should handle completely empty loader data", () => {
      mockUseLoaderData.mockReturnValue({
        mostLikedPosts: [],
        mostActiveAgents: [],
      });

      render(<Feed />);

      // Page structure should still render
      expect(
        screen.getByRole("link", { name: /sim feed/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("Most Active Agents")).toBeInTheDocument();
      expect(screen.getByText("Most Trending Posts")).toBeInTheDocument();
    });
  });

  describe("PostFeed Integration", () => {
    it("should show loading skeleton when posts are loading", () => {
      mockUseGetPosts.mockReturnValue({
        data: undefined,
        isLoading: true,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
      } as unknown as ReturnType<typeof useGetPosts>);

      render(<Feed />);

      // Skeleton posts have animate-pulse class - check for skeleton structure
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show "No posts available yet" when there are no posts', () => {
      mockUseGetPosts.mockReturnValue({
        data: { pages: [] },
        isLoading: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
      } as unknown as ReturnType<typeof useGetPosts>);

      render(<Feed />);

      expect(screen.getByText("No posts available yet.")).toBeInTheDocument();
    });

    it('should show "You\'ve reached the end" when no more posts to load', () => {
      mockUseGetPosts.mockReturnValue({
        data: {
          pages: [
            [
              {
                id: 1,
                body: "Test post",
                author: 1,
                author_username: "TestAgent",
                comments_count: 0,
                likes_count: 0,
                created_at: "2025-01-01T00:00:00Z",
              },
            ],
          ],
        },
        isLoading: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
      } as unknown as ReturnType<typeof useGetPosts>);

      render(<Feed />);

      expect(screen.getByText("You've reached the end")).toBeInTheDocument();
    });

    it("should show loading spinner when fetching next page", () => {
      mockUseGetPosts.mockReturnValue({
        data: {
          pages: [
            [
              {
                id: 1,
                body: "Test post",
                author: 1,
                author_username: "TestAgent",
                comments_count: 0,
                likes_count: 0,
                created_at: "2025-01-01T00:00:00Z",
              },
            ],
          ],
        },
        isLoading: false,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: true,
      } as unknown as ReturnType<typeof useGetPosts>);

      render(<Feed />);

      // Check for spinner element with animate-spin class
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should render posts from useGetPosts hook", () => {
      const mockPosts = [
        {
          id: 1,
          body: "First political satire post",
          author: 1,
          author_username: "SatireAgent",
          comments_count: 10,
          likes_count: 50,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 2,
          body: "Second political commentary",
          author: 2,
          author_username: "CommentBot",
          comments_count: 5,
          likes_count: 25,
          created_at: "2025-01-02T00:00:00Z",
        },
      ];

      mockUseGetPosts.mockReturnValue({
        data: { pages: [mockPosts] },
        isLoading: false,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
      } as unknown as ReturnType<typeof useGetPosts>);

      render(<Feed />);

      expect(screen.getByText("SatireAgent")).toBeInTheDocument();
      expect(screen.getByText("CommentBot")).toBeInTheDocument();
      expect(
        screen.getByText("First political satire post"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Second political commentary"),
      ).toBeInTheDocument();
    });
  });
});
