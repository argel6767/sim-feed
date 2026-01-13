import axios from "axios";
import { API_URL } from "../../configs/urls.ts";

const AGENTS_URL = `${API_URL}/agents`;
const PERSONAS_URL = `${API_URL}/personas`;

describe("Agents Endpoints", () => {
  describe("GET /agents", () => {
    it("should return 200 and list of agents", async () => {
      const response = await axios.get(AGENTS_URL);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return agents with expected structure", async () => {
      const response = await axios.get(AGENTS_URL);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);

      const agent = response.data[0];
      expect(agent).toHaveProperty("persona_id");
      expect(agent).toHaveProperty("bio");
      expect(agent).toHaveProperty("username");
      expect(agent).toHaveProperty("following_count");
      expect(agent).toHaveProperty("followers_count");
    });

    it("should return agents ordered by persona_id", async () => {
      const response = await axios.get(AGENTS_URL);

      expect(response.status).toBe(200);

      const personaIds = response.data.map((a: any) => Number(a.persona_id));
      for (let i = 0; i < personaIds.length - 1; i++) {
        expect(personaIds[i]).toBeLessThan(personaIds[i + 1]);
      }
    });

    it("should include seeded personas", async () => {
      const response = await axios.get(AGENTS_URL);

      expect(response.status).toBe(200);

      const usernames = response.data.map((a: any) => a.username);
      expect(usernames).toContain("techie_sam");
      expect(usernames).toContain("wanderlust_emma");
      expect(usernames).toContain("fit_marcus");
      expect(usernames).toContain("artsy_luna");
    });

    it("should return correct data for techie_sam", async () => {
      const response = await axios.get(AGENTS_URL);

      expect(response.status).toBe(200);

      const techie_sam = response.data.find(
        (a: any) => a.username === "techie_sam"
      );
      expect(techie_sam).toBeDefined();
      expect(techie_sam.bio).toBe("Tech enthusiast and coffee addict ☕");
      expect(Number(techie_sam.persona_id)).toBe(1);
    });

    it("should return correct data for wanderlust_emma", async () => {
      const response = await axios.get(AGENTS_URL);

      expect(response.status).toBe(200);

      const wanderlust_emma = response.data.find(
        (a: any) => a.username === "wanderlust_emma"
      );
      expect(wanderlust_emma).toBeDefined();
      expect(wanderlust_emma.bio).toBe("Living life one adventure at a time 🌍");
      expect(Number(wanderlust_emma.persona_id)).toBe(2);
    });

    it("should return following_count as a number", async () => {
      const response = await axios.get(AGENTS_URL);

      expect(response.status).toBe(200);

      for (const agent of response.data) {
        expect(Number(agent.following_count)).not.toBeNaN();
        expect(Number(agent.following_count)).toBeGreaterThanOrEqual(0);
      }
    });

    it("should return followers_count as a number", async () => {
      const response = await axios.get(AGENTS_URL);

      expect(response.status).toBe(200);

      for (const agent of response.data) {
        expect(Number(agent.followers_count)).not.toBeNaN();
        expect(Number(agent.followers_count)).toBeGreaterThanOrEqual(0);
      }
    });

    it("should include CORS headers in response", async () => {
      const response = await axios.get(AGENTS_URL);

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty("content-type");
      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("should handle OPTIONS request for CORS preflight", async () => {
      const response = await axios.options(AGENTS_URL);

      expect(response.status).toBe(200);
    });
  });

  describe("Cross-endpoint consistency", () => {
    it("should return consistent persona data with /personas/:persona_id", async () => {
      const agentsResponse = await axios.get(AGENTS_URL);
      const personaResponse = await axios.get(`${PERSONAS_URL}/1`);

      expect(agentsResponse.status).toBe(200);
      expect(personaResponse.status).toBe(200);

      const agentFromList = agentsResponse.data.find(
        (a: any) => String(a.persona_id) === "1"
      );

      expect(agentFromList).toBeDefined();
      expect(agentFromList.username).toBe(personaResponse.data.username);
      expect(agentFromList.bio).toBe(personaResponse.data.bio);
    });

    it("should return consistent persona data with /personas/most-active/:limit", async () => {
      const agentsResponse = await axios.get(AGENTS_URL);
      const activeResponse = await axios.get(`${PERSONAS_URL}/most-active/10`);

      expect(agentsResponse.status).toBe(200);
      expect(activeResponse.status).toBe(200);

      for (const activeAgent of activeResponse.data) {
        const agentFromList = agentsResponse.data.find(
          (a: any) => String(a.persona_id) === String(activeAgent.persona_id)
        );

        expect(agentFromList).toBeDefined();
        expect(agentFromList.username).toBe(activeAgent.username);
      }
    });

    it("should have following_count matching actual relations count", async () => {
      const agentsResponse = await axios.get(AGENTS_URL);

      expect(agentsResponse.status).toBe(200);

      // Check for persona 1
      const agent1 = agentsResponse.data.find(
        (a: any) => String(a.persona_id) === "1"
      );

      const relationsResponse = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "follower" },
      });

      expect(Number(agent1.following_count)).toBe(relationsResponse.data.length);
    });

    it("should have followers_count matching actual relations count", async () => {
      const agentsResponse = await axios.get(AGENTS_URL);

      expect(agentsResponse.status).toBe(200);

      // Check for persona 1
      const agent1 = agentsResponse.data.find(
        (a: any) => String(a.persona_id) === "1"
      );

      const relationsResponse = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "followed" },
      });

      expect(Number(agent1.followers_count)).toBe(relationsResponse.data.length);
    });

    it("should return all personas that exist in the database", async () => {
      const agentsResponse = await axios.get(AGENTS_URL);
      const activeResponse = await axios.get(`${PERSONAS_URL}/most-active/100`);

      expect(agentsResponse.status).toBe(200);
      expect(activeResponse.status).toBe(200);

      // All active personas should be in agents list
      for (const activeAgent of activeResponse.data) {
        const exists = agentsResponse.data.some(
          (a: any) => String(a.persona_id) === String(activeAgent.persona_id)
        );
        expect(exists).toBe(true);
      }
    });
  });
});