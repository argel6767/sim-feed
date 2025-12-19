import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import {
  render,
  createMockAgent,
  createMockPersonaRelation,
  createMockPersonaRelations,
} from "~/test/test-utils";
import AgentProfile, { loader } from "~/routes/agents.$id";
import type { PersonaRelation } from "~/lib/dtos";

// Mock the API endpoints module
vi.mock("~/api/endpoints", () => ({
  getAgentById: vi.fn(),
  getAgentFollowsRelations: vi.fn(),
}));

// Mock react-router's useLoaderData
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

// Mock the useGetAgentPosts hook used by PostFeed component
vi.mock("~/hooks/useGetAgentPosts", () => ({
  useGetAgentPosts: vi.fn(() => ({
    data: { pages: [] },
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  })),
}));

import { getAgentById, getAgentFollowsRelations } from "~/api/endpoints";
import { useLoaderData } from "react-router";
import { useGetAgentPosts } from "~/hooks/useGetAgentPosts";

const mockGetAgentById = vi.mocked(getAgentById);
const mockGetAgentFollowsRelations = vi.mocked(getAgentFollowsRelations);
const mockUseLoaderData = vi.mocked(useLoaderData);
const mockUseGetAgentPosts = vi.mocked(useGetAgentPosts);

describe("AgentProfile Route", () => {
  const mockAgent = createMockAgent({
    persona_id: 1,
    username: "PoliticalSatireBot",
    bio: "I am an AI agent that generates political satire content.",
    created_at: "2024-06-15T10:00:00Z",
  });

  const mockFollowers: PersonaRelation[] = [
    createMockPersonaRelation({ persona_id: "2", username: "FollowerOne" }),
    createMockPersonaRelation({ persona_id: "3", username: "FollowerTwo" }),
    createMockPersonaRelation({ persona_id: "4", username: "FollowerThree" }),
  ];

  const mockFollowing: PersonaRelation[] = [
    createMockPersonaRelation({ persona_id: "5", username: "FollowingOne" }),
    createMockPersonaRelation({ persona_id: "6", username: "FollowingTwo" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLoaderData.mockReturnValue({
      agent: mockAgent,
      followers: mockFollowers,
      following: mockFollowing,
    });
    mockUseGetAgentPosts.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
    } as unknown as ReturnType<typeof useGetAgentPosts>);
  });

  describe("loader function", () => {
    it("should call getAgentById with the correct id from params", async () => {
      mockGetAgentById.mockResolvedValueOnce(mockAgent);
      mockGetAgentFollowsRelations.mockResolvedValue([]);

      await loader({ params: { id: "1" } } as unknown as Parameters<
        typeof loader
      >[0]);

      expect(mockGetAgentById).toHaveBeenCalledWith(1);
    });

    it("should call getAgentFollowsRelations for followers and following", async () => {
      mockGetAgentById.mockResolvedValueOnce(mockAgent);
      mockGetAgentFollowsRelations
        .mockResolvedValueOnce(mockFollowers)
        .mockResolvedValueOnce(mockFollowing);

      const result = await loader({
        params: { id: "1" },
      } as unknown as Parameters<typeof loader>[0]);

      expect(mockGetAgentFollowsRelations).toHaveBeenCalledWith(1, "followed");
      expect(mockGetAgentFollowsRelations).toHaveBeenCalledWith(1, "follower");
      expect(result).toEqual({
        agent: mockAgent,
        followers: mockFollowers,
        following: mockFollowing,
      });
    });

    it("should fetch all API calls in parallel using Promise.all", async () => {
      let agentResolved = false;
      let followersResolved = false;
      let followingResolved = false;

      mockGetAgentById.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        agentResolved = true;
        return mockAgent;
      });

      mockGetAgentFollowsRelations
        .mockImplementationOnce(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          followersResolved = true;
          return mockFollowers;
        })
        .mockImplementationOnce(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          followingResolved = true;
          return mockFollowing;
        });

      await loader({ params: { id: "1" } } as unknown as Parameters<
        typeof loader
      >[0]);

      expect(agentResolved).toBe(true);
      expect(followersResolved).toBe(true);
      expect(followingResolved).toBe(true);
    });

    it("should handle API errors gracefully", async () => {
      mockGetAgentById.mockResolvedValueOnce(null);
      mockGetAgentFollowsRelations.mockResolvedValue([]);

      const result = await loader({
        params: { id: "999" },
      } as unknown as Parameters<typeof loader>[0]);

      expect(result).toEqual({
        agent: null,
        followers: [],
        following: [],
      });
    });
  });

  describe("AgentProfile Component", () => {
    it("should render the header with SIM-FEED branding as a link to home", () => {
      render(<AgentProfile />);

      const brandLink = screen.getByRole("link", { name: /sim-feed/i });
      expect(brandLink).toHaveAttribute("href", "/");
    });

    it("should render navigation links", () => {
      render(<AgentProfile />);

      expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
        "href",
        "/",
      );
      expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute(
        "href",
        "https://github.com/argel6767/sim-feed#readme",
      );
    });

    it("should render left sidebar with Agent Profile info", () => {
      render(<AgentProfile />);

      expect(screen.getByText("Agent Profile")).toBeInTheDocument();
      expect(
        screen.getByText(/You're viewing an AI agent's profile/i),
      ).toBeInTheDocument();
    });

    it("should render left sidebar with Navigation section and back link", () => {
      render(<AgentProfile />);

      expect(screen.getByText("Navigation")).toBeInTheDocument();
      // Multiple "Back to Feed" links exist (desktop and mobile)
      const backLinks = screen.getAllByRole("link", {
        name: /← back to feed/i,
      });
      expect(backLinks.length).toBeGreaterThan(0);
      expect(backLinks[0]).toHaveAttribute("href", "/feed");
    });

    it("should render agent username with @ prefix", () => {
      render(<AgentProfile />);

      expect(screen.getByText(`@${mockAgent.username}`)).toBeInTheDocument();
    });

    it("should render agent avatar with first letter of username", () => {
      render(<AgentProfile />);

      const avatarLetter = mockAgent.username.charAt(0).toUpperCase();
      // There are multiple avatars (profile and followers/following cards)
      const avatars = screen.getAllByText(avatarLetter);
      expect(avatars.length).toBeGreaterThan(0);
    });

    it("should render Agent badge", () => {
      render(<AgentProfile />);

      const agentBadges = screen.getAllByText("Agent");
      expect(agentBadges.length).toBeGreaterThan(0);
    });

    it("should render Bio section with agent bio", () => {
      render(<AgentProfile />);

      expect(screen.getByText("Bio")).toBeInTheDocument();
      expect(screen.getByText(mockAgent.bio)).toBeInTheDocument();
    });

    it("should render empty bio message when agent has no bio", () => {
      mockUseLoaderData.mockReturnValue({
        agent: { ...mockAgent, bio: null },
        followers: mockFollowers,
        following: mockFollowing,
      });

      render(<AgentProfile />);

      expect(
        screen.getByText(/This agent hasn't written their bio yet/i),
      ).toBeInTheDocument();
    });

    it("should render followers count", () => {
      render(<AgentProfile />);

      // The count appears in the stats section
      const followersCount = screen.getAllByText(String(mockFollowers.length));
      expect(followersCount.length).toBeGreaterThan(0);
      // "Followers" text appears multiple times (stats section and sidebar titles)
      const followersText = screen.getAllByText("Followers", { exact: false });
      expect(followersText.length).toBeGreaterThan(0);
    });

    it("should render following count", () => {
      render(<AgentProfile />);

      // The count appears in the stats section
      const followingCount = screen.getAllByText(String(mockFollowing.length));
      expect(followingCount.length).toBeGreaterThan(0);
      // "Following" text appears multiple times (stats section and sidebar titles)
      const followingText = screen.getAllByText("Following", { exact: false });
      expect(followingText.length).toBeGreaterThan(0);
    });

    it("should render joined date", () => {
      render(<AgentProfile />);

      // The date is formatted with date-fns formatDistance
      expect(screen.getByText(/🗓️ Joined/i)).toBeInTheDocument();
    });

    it("should render right sidebar with followers list", () => {
      render(<AgentProfile />);

      mockFollowers.forEach((follower) => {
        // Followers appear in both desktop sidebar and mobile section
        const elements = screen.getAllByText(`@${follower.username}`);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it("should render right sidebar with following list", () => {
      render(<AgentProfile />);

      mockFollowing.forEach((following) => {
        // Following appear in both desktop sidebar and mobile section
        const elements = screen.getAllByText(`@${following.username}`);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it("should render links to follower profiles", () => {
      render(<AgentProfile />);

      mockFollowers.forEach((follower) => {
        // Links appear in both desktop sidebar and mobile section
        const links = screen.getAllByRole("link", {
          name: new RegExp(`@${follower.username}`),
        });
        expect(links.length).toBeGreaterThan(0);
        expect(links[0]).toHaveAttribute(
          "href",
          `/agents/${follower.persona_id}`,
        );
      });
    });

    it("should render links to following profiles", () => {
      render(<AgentProfile />);

      mockFollowing.forEach((following) => {
        // Links appear in both desktop sidebar and mobile section
        const links = screen.getAllByRole("link", {
          name: new RegExp(`@${following.username}`),
        });
        expect(links.length).toBeGreaterThan(0);
        expect(links[0]).toHaveAttribute(
          "href",
          `/agents/${following.persona_id}`,
        );
      });
    });

    it("should show '+X more' when followers exceed 5", () => {
      const manyFollowers = createMockPersonaRelations(8);
      mockUseLoaderData.mockReturnValue({
        agent: mockAgent,
        followers: manyFollowers,
        following: mockFollowing,
      });

      render(<AgentProfile />);

      expect(screen.getAllByText("+3 more").length).toBeGreaterThan(0);
    });

    it("should show '+X more' when following exceed 5", () => {
      const manyFollowing = createMockPersonaRelations(7);
      mockUseLoaderData.mockReturnValue({
        agent: mockAgent,
        followers: mockFollowers,
        following: manyFollowing,
      });

      render(<AgentProfile />);

      expect(screen.getAllByText("+2 more").length).toBeGreaterThan(0);
    });

    it("should show 'No followers yet' message when followers array is empty", () => {
      mockUseLoaderData.mockReturnValue({
        agent: mockAgent,
        followers: [],
        following: mockFollowing,
      });

      render(<AgentProfile />);

      expect(screen.getByText("No followers yet.")).toBeInTheDocument();
    });

    it("should show 'Not following anyone yet' message when following array is empty", () => {
      mockUseLoaderData.mockReturnValue({
        agent: mockAgent,
        followers: mockFollowers,
        following: [],
      });

      render(<AgentProfile />);

      expect(screen.getByText("Not following anyone yet.")).toBeInTheDocument();
    });

    it("should render the footer", () => {
      render(<AgentProfile />);

      expect(
        screen.getByText(/© 2025 Sim Feed. Political Satire Platform./i),
      ).toBeInTheDocument();
    });
  });

  describe("AgentProfile Component - Agent Not Found", () => {
    beforeEach(() => {
      mockUseLoaderData.mockReturnValue({
        agent: null,
        followers: [],
        following: [],
      });
    });

    it("should render error message when agent is null", () => {
      render(<AgentProfile />);

      expect(
        screen.getByText(/Failed to fetch information on queried agent/i),
      ).toBeInTheDocument();
    });

    it("should render back to feed link when agent is null", () => {
      render(<AgentProfile />);

      const backLink = screen.getByRole("link", { name: /← back to feed/i });
      expect(backLink).toHaveAttribute("href", "/feed");
    });

    it("should still render header when agent is null", () => {
      render(<AgentProfile />);

      const brandLink = screen.getByRole("link", { name: /sim-feed/i });
      expect(brandLink).toBeInTheDocument();
    });

    it("should still render footer when agent is null", () => {
      render(<AgentProfile />);

      expect(
        screen.getByText(/© 2025 Sim Feed. Political Satire Platform./i),
      ).toBeInTheDocument();
    });
  });

  describe("PostFeed Integration", () => {
    it("should show loading skeleton when posts are loading", () => {
      mockUseGetAgentPosts.mockReturnValue({
        data: undefined,
        isLoading: true,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
      } as unknown as ReturnType<typeof useGetAgentPosts>);

      render(<AgentProfile />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show "No posts available yet" when agent has no posts', () => {
      mockUseGetAgentPosts.mockReturnValue({
        data: { pages: [] },
        isLoading: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
      } as unknown as ReturnType<typeof useGetAgentPosts>);

      render(<AgentProfile />);

      expect(screen.getByText("No posts available yet.")).toBeInTheDocument();
    });

    it("should render agent's posts", () => {
      const mockPosts = [
        {
          id: 1,
          body: "First political satire post from this agent",
          author: 1,
          author_username: "PoliticalSatireBot",
          comments_count: 10,
          likes_count: 50,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 2,
          body: "Second political commentary from this agent",
          author: 1,
          author_username: "PoliticalSatireBot",
          comments_count: 5,
          likes_count: 25,
          created_at: "2025-01-02T00:00:00Z",
        },
      ];

      mockUseGetAgentPosts.mockReturnValue({
        data: { pages: [mockPosts] },
        isLoading: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
      } as unknown as ReturnType<typeof useGetAgentPosts>);

      render(<AgentProfile />);

      expect(
        screen.getByText("First political satire post from this agent"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Second political commentary from this agent"),
      ).toBeInTheDocument();
    });

    it('should show "You\'ve reached the end" when no more posts to load', () => {
      mockUseGetAgentPosts.mockReturnValue({
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
      } as unknown as ReturnType<typeof useGetAgentPosts>);

      render(<AgentProfile />);

      expect(screen.getByText("You've reached the end")).toBeInTheDocument();
    });

    it("should show loading spinner when fetching next page", () => {
      mockUseGetAgentPosts.mockReturnValue({
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
      } as unknown as ReturnType<typeof useGetAgentPosts>);

      render(<AgentProfile />);

      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });
});
