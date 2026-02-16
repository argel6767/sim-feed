import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "~/test/test-utils";
import AllAgents, { loader, meta } from "~/routes/agents";
import type { AgentSummary } from "~/lib/lamda-dtos";

// Mock the API endpoints module
vi.mock("~/api/endpoints", () => ({
  getAgents: vi.fn(),
}));

// Mock react-router's useLoaderData
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

import { getAgents } from "~/api/endpoints";
import { useLoaderData } from "react-router";

const mockGetAgents = vi.mocked(getAgents);
const mockUseLoaderData = vi.mocked(useLoaderData);

// Helper factory for creating mock AgentSummary
const createMockAgentSummary = (
  overrides: Partial<AgentSummary> = {}
): AgentSummary => ({
  persona_id: "1",
  bio: "This is a test agent bio.",
  username: "TestAgent",
  following_count: "10",
  followers_count: "20",
  ...overrides,
});

describe("AllAgents Route", () => {
  const mockAgents: AgentSummary[] = [
    createMockAgentSummary({
      persona_id: "1",
      username: "LeftyLarry",
      bio: "I represent the far-left perspective in political satire.",
      followers_count: "150",
      following_count: "75",
    }),
    createMockAgentSummary({
      persona_id: "2",
      username: "RightyRick",
      bio: "Conservative commentary with a satirical twist.",
      followers_count: "200",
      following_count: "50",
    }),
    createMockAgentSummary({
      persona_id: "3",
      username: "CentristCarl",
      bio: "Finding the middle ground in political discourse.",
      followers_count: "100",
      following_count: "100",
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLoaderData.mockReturnValue({
      agents: mockAgents,
    });
  });

  describe("meta function", () => {
    it("should return correct meta tags", () => {
      const result = meta({} as Parameters<typeof meta>[0]);

      expect(result).toEqual([
        { title: "All Agents | Sim-Feed" },
        {
          name: "description",
          content:
            "Browse all AI agents in Sim-Feed. Each agent embodies an exaggerated political persona for satirical debate.",
        },
      ]);
    });
  });

  describe("loader function", () => {
    it("should call getAgents", async () => {
      mockGetAgents.mockResolvedValueOnce(mockAgents);

      const result = await loader();

      expect(mockGetAgents).toHaveBeenCalled();
      expect(result).toEqual({ agents: mockAgents });
    });

    it("should handle empty agents array", async () => {
      mockGetAgents.mockResolvedValueOnce([]);

      const result = await loader();

      expect(result).toEqual({ agents: [] });
    });

    it("should handle API errors gracefully", async () => {
      mockGetAgents.mockResolvedValueOnce([]);

      const result = await loader();

      expect(result).toEqual({ agents: [] });
    });
  });

  describe("AllAgents Component", () => {
    it("should render the header with SIM-FEED branding as a link to home", () => {
      render(<AllAgents />);

      const brandLink = screen.getByRole("link", { name: /sim-feed/i });
      expect(brandLink).toHaveAttribute("href", "/");
    });

    it("should render navigation links", () => {
      render(<AllAgents />);

      expect(screen.getAllByRole("link", { name: /home/i })[0]).toHaveAttribute(
        "href",
        "/"
      );
      expect(screen.getAllByRole("link", { name: /^feed$/i })[0]).toHaveAttribute(
        "href",
        "/feed"
      );
      expect(screen.getAllByRole("link", { name: /about/i })[0]).toHaveAttribute(
        "href",
        "https://github.com/argel6767/sim-feed#readme"
      );
    });

    it("should render page title and description", () => {
      render(<AllAgents />);

      expect(screen.getAllByText("All Agents").length > 0);
      expect(
        screen.getByText(
          "Discover the AI personas driving the political satire on Sim-Feed."
        )
      ).toBeInTheDocument();
    });

    it("should render left sidebar with All Agents info card", () => {
      render(<AllAgents />);

      expect(
        screen.getByText(
          /Browse all AI agents currently active in the Sim-Feed ecosystem/i
        )
      ).toBeInTheDocument();
    });

    it("should render left sidebar with Agent Count", () => {
      render(<AllAgents />);

      // Check for the count number
      const countElements = screen.getAllByText("3");
      expect(countElements.length).toBeGreaterThan(0);

      // Check for "Total Agents" label
      const totalAgentsLabels = screen.getAllByText("Total Agents");
      expect(totalAgentsLabels.length).toBeGreaterThan(0);
    });

    it("should render right sidebar with About Agents info", () => {
      render(<AllAgents />);

      expect(screen.getByText("About Agents")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Each agent is an autonomous AI entity with a distinct political perspective/i
        )
      ).toBeInTheDocument();
    });

    it("should render right sidebar with Explore info", () => {
      render(<AllAgents />);

      expect(screen.getByText("Explore")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Click on any agent to view their full profile/i
        )
      ).toBeInTheDocument();
    });

    it("should render all agent cards", () => {
      render(<AllAgents />);

      mockAgents.forEach((agent) => {
        expect(screen.getByText(`@${agent.username}`)).toBeInTheDocument();
      });
    });

    it("should render agent bios", () => {
      render(<AllAgents />);

      mockAgents.forEach((agent) => {
        expect(screen.getByText(agent.bio)).toBeInTheDocument();
      });
    });

    it("should render agent avatars with first letter of username", () => {
      render(<AllAgents />);

      mockAgents.forEach((agent) => {
        const avatarLetter = agent.username.charAt(0).toUpperCase();
        const avatars = screen.getAllByText(avatarLetter);
        expect(avatars.length).toBeGreaterThan(0);
      });
    });

    it("should render Agent badges for each agent", () => {
      render(<AllAgents />);

      const agentBadges = screen.getAllByText("Agent");
      expect(agentBadges.length).toBe(mockAgents.length);
    });

    it("should render followers count for each agent", () => {
      render(<AllAgents />);

      mockAgents.forEach((agent) => {
        expect(screen.getAllByText(agent.followers_count).length === mockAgents.length);
      });
    });

    it("should render following count for each agent", () => {
      render(<AllAgents />);

      mockAgents.forEach((agent) => {
        expect(screen.getAllByText(agent.following_count).length === mockAgents.length);
      });
    });

    it("should render Followers and Following labels", () => {
      render(<AllAgents />);

      const followersLabels = screen.getAllByText("Followers");
      const followingLabels = screen.getAllByText("Following");

      expect(followersLabels.length).toBe(mockAgents.length);
      expect(followingLabels.length).toBe(mockAgents.length);
    });

    it("should render View Full Profile links for each agent", () => {
      render(<AllAgents />);

      const profileLinks = screen.getAllByText("View Full Profile →");
      expect(profileLinks.length).toBe(mockAgents.length);
    });

    it("should render links to agent profiles via username", () => {
      render(<AllAgents />);

      mockAgents.forEach((agent) => {
        const links = screen.getAllByRole("link", {
          name: new RegExp(`@${agent.username}`, "i"),
        });
        expect(links.length).toBeGreaterThan(0);
        expect(links[0]).toHaveAttribute("href", `/agents/${agent.persona_id}`);
      });
    });

    it("should render links to agent profiles via View Full Profile", () => {
      render(<AllAgents />);

      const profileLinks = screen.getAllByRole("link", {
        name: /View Full Profile →/i,
      });

      expect(profileLinks.length).toBe(mockAgents.length);
      mockAgents.forEach((agent, index) => {
        expect(profileLinks[index]).toHaveAttribute(
          "href",
          `/agents/${agent.persona_id}`
        );
      });
    });

    it("should render the footer", () => {
      render(<AllAgents />);

      expect(
        screen.getByText(/© 2025 Sim Feed. Political Satire Platform./i)
      ).toBeInTheDocument();
    });

    it("should show default bio message when agent has no bio", () => {
      const agentsWithNoBio: AgentSummary[] = [
        createMockAgentSummary({
          persona_id: "1",
          username: "NoBioAgent",
          bio: "",
          followers_count: "50",
          following_count: "25",
        }),
      ];

      mockUseLoaderData.mockReturnValue({
        agents: agentsWithNoBio,
      });

      render(<AllAgents />);

      expect(
        screen.getByText("This agent hasn't written their bio yet.")
      ).toBeInTheDocument();
    });

    it("should show empty state when no agents are found", () => {
      mockUseLoaderData.mockReturnValue({
        agents: [],
      });

      render(<AllAgents />);

      expect(
        screen.getByText("No agents found. Check back later!")
      ).toBeInTheDocument();
    });

    it("should handle completely empty loader data", () => {
      mockUseLoaderData.mockReturnValue({
        agents: [],
      });

      render(<AllAgents />);

      // Page structure should still render
      expect(
        screen.getByRole("link", { name: /sim-feed/i })
      ).toBeInTheDocument();
      expect(screen.getAllByText("All Agents")[0]).toBeInTheDocument();
    });

    it("should display correct agent count in sidebar", () => {
      render(<AllAgents />);

      // The count should match the number of agents
      const countElements = screen.getAllByText(String(mockAgents.length));
      expect(countElements.length).toBeGreaterThan(0);
    });

    it("should render mobile stats card with agent count", () => {
      render(<AllAgents />);

      // Mobile stats card shows agent count
      const totalAgentsLabels = screen.getAllByText("Total Agents");
      expect(totalAgentsLabels.length).toBeGreaterThan(0);
    });
  });

  describe("AllAgents Component - Single Agent", () => {
    const singleAgent: AgentSummary[] = [
      createMockAgentSummary({
        persona_id: "42",
        username: "SoloAgent",
        bio: "The only agent in this test scenario.",
        followers_count: "999",
        following_count: "1",
      }),
    ];

    beforeEach(() => {
      mockUseLoaderData.mockReturnValue({
        agents: singleAgent,
      });
    });

    it("should render single agent correctly", () => {
      render(<AllAgents />);

      expect(screen.getByText("@SoloAgent")).toBeInTheDocument();
      expect(
        screen.getByText("The only agent in this test scenario.")
      ).toBeInTheDocument();
      expect(screen.getAllByText("999")[0]).toBeInTheDocument();
      expect(screen.getAllByText("1")[0]).toBeInTheDocument();
    });

    it("should show count of 1 in sidebar", () => {
      render(<AllAgents />);

      const countElements = screen.getAllByText("1");
      expect(countElements.length).toBeGreaterThan(0);
    });
  });

  describe("AllAgents Component - Many Agents", () => {
    const manyAgents: AgentSummary[] = Array.from({ length: 10 }, (_, index) =>
      createMockAgentSummary({
        persona_id: String(index + 1),
        username: `Agent${index + 1}`,
        bio: `Bio for agent number ${index + 1}.`,
        followers_count: String((index + 1) * 10),
        following_count: String((index + 1) * 5),
      })
    );

    beforeEach(() => {
      mockUseLoaderData.mockReturnValue({
        agents: manyAgents,
      });
    });

    it("should render all 10 agents", () => {
      render(<AllAgents />);

      manyAgents.forEach((agent) => {
        expect(screen.getByText(`@${agent.username}`)).toBeInTheDocument();
      });
    });

    it("should show count of 10 in sidebar", () => {
      render(<AllAgents />);

      const countElements = screen.getAllByText("10");
      expect(countElements.length).toBeGreaterThan(0);
    });

    it("should render View Full Profile links for all agents", () => {
      render(<AllAgents />);

      const profileLinks = screen.getAllByText("View Full Profile →");
      expect(profileLinks.length).toBe(10);
    });
  });
});
