import axios from "axios";
import { API_URL } from "../../configs/urls.ts";

const PERSONAS_URL = `${API_URL}/personas`;
const POSTS_URL = `${API_URL}/posts`;

describe("Personas Endpoints", () => {
  describe("GET /personas", () => {
    it("should return 200 and list of personas", async () => {
      const response = await axios.get(PERSONAS_URL);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return personas with expected structure", async () => {
      const response = await axios.get(PERSONAS_URL);

      expect(response.status).toBe(200);
      const persona = response.data[0];
      expect(persona).toHaveProperty("persona_id");
      expect(persona).toHaveProperty("bio");
      expect(persona).toHaveProperty("username");
      expect(persona).toHaveProperty("following_count");
      expect(persona).toHaveProperty("followers_count");
    });

    it("should return personas ordered by persona_id", async () => {
      const response = await axios.get(PERSONAS_URL);

      expect(response.status).toBe(200);
      const personaIds = response.data.map((p: any) => Number(p.persona_id));
      for (let i = 0; i < personaIds.length - 1; i++) {
        expect(personaIds[i]).toBeLessThan(personaIds[i + 1]);
      }
    });

    it("should return following_count and followers_count as numbers >= 0", async () => {
      const response = await axios.get(PERSONAS_URL);

      expect(response.status).toBe(200);
      for (const persona of response.data) {
        expect(Number(persona.following_count)).toBeGreaterThanOrEqual(0);
        expect(Number(persona.followers_count)).toBeGreaterThanOrEqual(0);
      }
    });

    it("should handle OPTIONS preflight request", async () => {
      const response = await axios.options(PERSONAS_URL);
      expect(response.status).toBe(204);
    });
  });

  describe("GET /personas/:persona_id", () => {
    it("should return 200 and persona data for valid ID", async () => {
      const response = await axios.get(`${PERSONAS_URL}/1`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("persona_id");
      expect(response.data).toHaveProperty("bio");
      expect(response.data).toHaveProperty("username");
      expect(response.data).toHaveProperty("created_at");
    });

    it("should return correct persona for ID 1", async () => {
      const response = await axios.get(`${PERSONAS_URL}/1`);

      expect(response.status).toBe(200);
      expect(Number(response.data.persona_id)).toBe(1);
    });

    it("should return 404 for non-existent persona", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/99999`);
        fail("Expected 404 error");
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe("Not Found");
      }
    });

    it("should return 400 for invalid persona_id (non-numeric)", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/abc`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe("Bad Request");
      }
    });

    it("should return 400 for negative persona_id", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/-1`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe("Bad Request");
      }
    });

    it("should handle OPTIONS preflight request", async () => {
      const response = await axios.options(`${PERSONAS_URL}/1`);
      expect(response.status).toBe(204);
    });
  });

  describe("GET /personas/most-active/:limit", () => {
    it("should return 200 and list of active personas", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/10`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return personas with post_count", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/10`);

      expect(response.status).toBe(200);
      if (response.data.length > 0) {
        const persona = response.data[0];
        expect(persona).toHaveProperty("persona_id");
        expect(persona).toHaveProperty("username");
        expect(persona).toHaveProperty("post_count");
      }
    });

    it("should return personas ordered by post_count descending", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/10`);

      expect(response.status).toBe(200);
      const postCounts = response.data.map((p: any) => Number(p.post_count));
      for (let i = 0; i < postCounts.length - 1; i++) {
        expect(postCounts[i]).toBeGreaterThanOrEqual(postCounts[i + 1]);
      }
    });

    it("should respect the limit parameter", async () => {
      const response = await axios.get(`${PERSONAS_URL}/most-active/5`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeLessThanOrEqual(5);
    });

    it("should return 400 for limit of 0", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/most-active/0`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 for limit > 100", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/most-active/101`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 for non-numeric limit", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/most-active/abc`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should handle OPTIONS preflight request", async () => {
      const response = await axios.options(`${PERSONAS_URL}/most-active/10`);
      expect(response.status).toBe(204);
    });
  });

  describe("GET /personas/:persona_id/relations", () => {
    it("should return 200 and list of followers when relation=followed", async () => {
      const response = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "followed" },
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return 200 and list of following when relation=follower", async () => {
      const response = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "follower" },
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return personas with persona_id and username", async () => {
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

    it("should return 400 when relation parameter is missing", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/1/relations`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain("relation");
      }
    });

    it("should return 400 for invalid relation parameter", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/1/relations`, {
          params: { relation: "invalid" },
        });
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 for invalid persona_id", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/abc/relations`, {
          params: { relation: "follower" },
        });
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 for negative persona_id", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/-1/relations`, {
          params: { relation: "follower" },
        });
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should handle OPTIONS preflight request", async () => {
      const response = await axios.options(`${PERSONAS_URL}/1/relations`);
      expect(response.status).toBe(204);
    });
  });

  describe("GET /posts/personas/:persona_id/pages/:page", () => {
    it("should return 200 and list of posts for valid persona", async () => {
      const response = await axios.get(`${POSTS_URL}/personas/1/pages/1`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return posts with expected structure", async () => {
      const response = await axios.get(`${POSTS_URL}/personas/1/pages/1`);

      expect(response.status).toBe(200);
      if (response.data.length > 0) {
        const post = response.data[0];
        expect(post).toHaveProperty("id");
        expect(post).toHaveProperty("body");
        expect(post).toHaveProperty("author");
        expect(post).toHaveProperty("author_username");
        expect(post).toHaveProperty("created_at");
        expect(post).toHaveProperty("likes_count");
        expect(post).toHaveProperty("comments_count");
      }
    });

    it("should return posts only from the specified persona", async () => {
      const response = await axios.get(`${POSTS_URL}/personas/1/pages/1`);

      expect(response.status).toBe(200);
      for (const post of response.data) {
        expect(Number(post.author)).toBe(1);
      }
    });

    it("should return empty array for persona with no posts", async () => {
      // Assuming persona 99999 doesn't exist or has no posts
      const response = await axios.get(`${POSTS_URL}/personas/9999/pages/1`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return 400 for invalid persona_id", async () => {
      try {
        await axios.get(`${POSTS_URL}/personas/abc/pages/1`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 for persona_id of 0", async () => {
      try {
        await axios.get(`${POSTS_URL}/personas/0/pages/1`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 for invalid page number", async () => {
      try {
        await axios.get(`${POSTS_URL}/personas/1/pages/abc`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 for negative page number", async () => {
      try {
        await axios.get(`${POSTS_URL}/personas/1/pages/-1`);
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should handle OPTIONS preflight request", async () => {
      const response = await axios.options(`${POSTS_URL}/personas/1/pages/1`);
      expect(response.status).toBe(204);
    });
  });

  describe("Cross-endpoint consistency", () => {
    it("should have consistent data between /personas and /personas/:id", async () => {
      const listResponse = await axios.get(PERSONAS_URL);
      const singleResponse = await axios.get(`${PERSONAS_URL}/1`);

      expect(listResponse.status).toBe(200);
      expect(singleResponse.status).toBe(200);

      const fromList = listResponse.data.find(
        (p: any) => Number(p.persona_id) === 1
      );

      expect(fromList).toBeDefined();
      expect(fromList.username).toBe(singleResponse.data.username);
      expect(fromList.bio).toBe(singleResponse.data.bio);
    });

    it("should have following_count matching relations count", async () => {
      const listResponse = await axios.get(PERSONAS_URL);
      const relationsResponse = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "follower" },
      });

      const persona = listResponse.data.find(
        (p: any) => Number(p.persona_id) === 1
      );

      expect(Number(persona.following_count)).toBe(relationsResponse.data.length);
    });

    it("should have followers_count matching relations count", async () => {
      const listResponse = await axios.get(PERSONAS_URL);
      const relationsResponse = await axios.get(`${PERSONAS_URL}/1/relations`, {
        params: { relation: "followed" },
      });

      const persona = listResponse.data.find(
        (p: any) => Number(p.persona_id) === 1
      );

      expect(Number(persona.followers_count)).toBe(relationsResponse.data.length);
    });
  });
});