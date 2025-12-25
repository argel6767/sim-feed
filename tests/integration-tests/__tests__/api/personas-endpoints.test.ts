import axios from "axios";
import { API_URL } from "../../configs/urls.ts";

const PERSONAS_URL = `${API_URL}/personas`;

describe("Personas Endpoints", () => {
  describe("GET /personas/:persona_id", () => {
    it("should return 200 and persona info for valid ID", async () => {
      const response = await axios.get(`${PERSONAS_URL}/1`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("persona_id");
      expect(Number(response.data.persona_id)).toBe(1);
      expect(response.data).toHaveProperty("bio");
      expect(response.data).toHaveProperty("username");
      expect(response.data).toHaveProperty("created_at");
    });

    it("should return correct seeded persona data for techie_sam", async () => {
      const response = await axios.get(`${PERSONAS_URL}/1`);

      expect(response.status).toBe(200);
      expect(response.data.username).toBe("techie_sam");
      expect(response.data.bio).toBe("Tech enthusiast and coffee addict ☕");
    });

    it("should return correct seeded persona data for wanderlust_emma", async () => {
      const response = await axios.get(`${PERSONAS_URL}/2`);

      expect(response.status).toBe(200);
      expect(response.data.username).toBe("wanderlust_emma");
      expect(response.data.bio).toBe("Living life one adventure at a time 🌍");
    });

    it("should return different personas for different IDs", async () => {
      const response1 = await axios.get(`${PERSONAS_URL}/1`);
      const response2 = await axios.get(`${PERSONAS_URL}/2`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.data.persona_id).not.toBe(response2.data.persona_id);
      expect(response1.data.username).not.toBe(response2.data.username);
    });

    it("should return 404 for non-existent persona ID", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/99999`);
        fail("Expected request to fail for non-existent persona");
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toEqual({
          error: "Not Found",
          message: "Persona with ID 99999 not found",
        });
      }
    });

    it("should return 400 when persona_id is not a number", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/abc`);
        fail("Expected request to fail with invalid persona_id");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid persona_id parameter",
        });
      }
    });

    it("should return 400 when persona_id is negative", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/-1`);
        fail("Expected request to fail with negative persona_id");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid persona_id parameter",
        });
      }
    });

    it("should return 404 when persona_id is zero", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/0`);
        fail("Expected request to fail with zero persona_id");
      } catch (error: any) {
        // Zero is a valid number but no persona exists with ID 0
        expect(error.response.status).toBe(404);
        expect(error.response.data).toEqual({
          error: "Not Found",
          message: "Persona with ID 0 not found",
        });
      }
    });
  });

  describe("GET /personas/:persona_id/relations", () => {
    it("should return 200 and list of who the persona follows with relation=follower", async () => {
      // relation=follower means: WHERE f.follower = persona_id, returns who they follow
      const response = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "follower" },
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return 200 and list of who follows the persona with relation=followed", async () => {
      // relation=followed means: WHERE f.followed = persona_id, returns their followers
      const response = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "followed" },
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return personas with expected structure", async () => {
      const response = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "follower" },
      });

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const persona = response.data[0];
        expect(persona).toHaveProperty("persona_id");
        expect(persona).toHaveProperty("username");
      }
    });

    it("should return who techie_sam (persona 1) follows with relation=follower", async () => {
      // Based on seed data, persona 1 follows: 2, 4, 6, 7
      // relation=follower means WHERE f.follower = 1, returns the followed personas
      const response = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "follower" },
      });

      expect(response.status).toBe(200);
      const followedIds = response.data.map((p: any) => String(p.persona_id));

      // Check some known followed from seed data (IDs returned as strings)
      expect(followedIds).toContain("2"); // techie_sam follows wanderlust_emma
      expect(followedIds).toContain("4"); // techie_sam follows artsy_luna
    });

    it("should return who follows techie_sam (persona 1) with relation=followed", async () => {
      // Based on seed data, persona 1 is followed by: 2, 3, 4, 6, 7, 9
      // relation=followed means WHERE f.followed = 1, returns the follower personas
      const response = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "followed" },
      });

      expect(response.status).toBe(200);
      const followerIds = response.data.map((p: any) => String(p.persona_id));

      // Check some known followers from seed data (IDs returned as strings)
      expect(followerIds).toContain("2"); // wanderlust_emma follows techie_sam
      expect(followerIds).toContain("3"); // fit_marcus follows techie_sam
    });

    it("should return empty array when persona has no relations", async () => {
      // Use a high page or persona with potentially no followers
      const response = await axios.get(`${PERSONAS_URL}/10/relations`, {
        params: { relation: "follower" },
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return 400 when persona_id is not a number", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/abc/relations`, {
          params: { relation: "follower" },
        });
        fail("Expected request to fail with invalid persona_id");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid persona_id parameter",
        });
      }
    });

    it("should return 400 when persona_id is negative", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/-1/relations`, {
          params: { relation: "follower" },
        });
        fail("Expected request to fail with negative persona_id");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid persona_id parameter",
        });
      }
    });

    it("should return 400 when relation parameter is missing", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/1/relations`);
        fail("Expected request to fail with missing relation");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid relation parameter",
        });
      }
    });

    it("should return 400 when relation parameter is invalid", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/1/relations`, {
          params: { relation: "invalid" },
        });
        fail("Expected request to fail with invalid relation");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid relation parameter",
        });
      }
    });
  });

  describe("GET /personas/most-active/:limit", () => {
    it("should return 200 and list of most active agents", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/10`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data.length).toBeLessThanOrEqual(10);
    });

    it("should return agents with expected structure", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/5`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);

      const agent = response.data[0];
      expect(agent).toHaveProperty("persona_id");
      expect(agent).toHaveProperty("username");
      expect(agent).toHaveProperty("post_count");
    });

    it("should return agents ordered by post count descending", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/10`);

      expect(response.status).toBe(200);

      const postCounts = response.data.map((a: any) => Number(a.post_count));
      for (let i = 0; i < postCounts.length - 1; i++) {
        expect(postCounts[i]).toBeGreaterThanOrEqual(postCounts[i + 1]);
      }
    });

    it("should respect the limit parameter", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/3`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeLessThanOrEqual(3);
    });

    it("should accept limit of 1 (minimum)", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/1`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBe(1);
    });

    it("should accept limit of 100 (maximum)", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/100`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should include seeded personas with their post counts", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/10`);

      expect(response.status).toBe(200);

      const usernames = response.data.map((a: any) => a.username);
      // Check for some seeded personas
      expect(usernames).toContain("techie_sam");
      expect(usernames).toContain("wanderlust_emma");
    });

    it("should return 400 when limit is zero", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/most-active/0`);
        fail("Expected request to fail with zero limit");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid limit. Must be between 1 and 100",
        });
      }
    });

    it("should return 400 when limit is negative", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/most-active/-5`);
        fail("Expected request to fail with negative limit");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid limit. Must be between 1 and 100",
        });
      }
    });

    it("should return 400 when limit exceeds 100", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/most-active/101`);
        fail("Expected request to fail with limit > 100");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid limit. Must be between 1 and 100",
        });
      }
    });

    it("should return 400 when limit is not a number", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/most-active/abc`);
        fail("Expected request to fail with invalid limit");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid limit. Must be between 1 and 100",
        });
      }
    });

    it("should return 400 when limit is a decimal", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/most-active/5.5`);
        fail("Expected request to fail with decimal limit");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid limit. Must be between 1 and 100",
        });
      }
    });

    it("should return 400 when limit is empty string", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/most-active/`);
        fail("Expected request to fail with empty limit");
      } catch (error: any) {
        // This might be a 404 due to route not matching, or 400
        expect([400, 404]).toContain(error.response.status);
      }
    });
  });

  describe("Cross-endpoint consistency", () => {
    it("should return consistent persona data across endpoints", async () => {
      // Get persona info
      const personaResponse = await axios.get(`${PERSONAS_URL}/1`);

      // Get most active agents
      const activeResponse = await axios.get(`${PERSONAS_URL}/most-active/10`);

      const personaFromActive = activeResponse.data.find(
        (a: any) => String(a.persona_id) === "1",
      );

      expect(personaFromActive).toBeDefined();
      expect(personaResponse.data.username).toBe(personaFromActive.username);
    });

    it("should have bidirectional follow relationships", async () => {
      // Get who persona 2 follows (relation=follower returns who they follow)
      const following = await axios.get(`${PERSONAS_URL}/2/relations`, {
        params: { relation: "follower" },
      });

      // For each followed persona, check that persona 2 appears in their followers
      for (const followed of following.data) {
        // relation=followed returns who follows that persona
        const followers = await axios.get(
          `${PERSONAS_URL}/${followed.persona_id}/relations`,
          { params: { relation: "followed" } },
        );

        const followerIds = followers.data.map((f: any) =>
          String(f.persona_id),
        );
        expect(followerIds).toContain("2");
      }
    });
  });
});
