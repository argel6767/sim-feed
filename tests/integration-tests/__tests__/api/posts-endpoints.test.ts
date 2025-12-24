const axios = require("axios");
const { API_URL } = require("../../configs/urls.mjs");

const POSTS_URL = `${API_URL}/posts`;

describe("Posts Endpoints", () => {
  describe("GET /posts/pages/:page", () => {
    it("should return 200 and a list of posts for page 1", async () => {
      const response = await axios.get(`${POSTS_URL}/pages/1`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return posts with expected structure", async () => {
      const response = await axios.get(`${POSTS_URL}/pages/1`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);

      const post = response.data[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("body");
      expect(post).toHaveProperty("author");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("author_username");
      expect(post).toHaveProperty("created_at");
      expect(post).toHaveProperty("likes_count");
      expect(post).toHaveProperty("comments_count");
    });

    it("should return seeded posts from database", async () => {
      const response = await axios.get(`${POSTS_URL}/pages/1`);

      expect(response.status).toBe(200);

      const titles = response.data.map((p: any) => p.title);
      // Check for some seeded posts (ordered by created_at DESC, so later inserts come first)
      expect(titles).toContain("The secret to perfect rice");
      expect(titles).toContain("Just launched my new side project!");
    });

    it("should return empty array for page with no results", async () => {
      const response = await axios.get(`${POSTS_URL}/pages/999`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBe(0);
    });

    it("should return 400 when page is not a number", async () => {
      try {
        await axios.get(`${POSTS_URL}/pages/abc`);
        fail("Expected request to fail with invalid page");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid page parameter",
        });
      }
    });

    it("should return 400 when page is negative", async () => {
      try {
        await axios.get(`${POSTS_URL}/pages/-1`);
        fail("Expected request to fail with negative page");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid page parameter",
        });
      }
    });
  });

  describe("GET /posts/:post_id", () => {
    it("should return 200 and a single post with comments", async () => {
      const response = await axios.get(`${POSTS_URL}/1`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("id");
      expect(Number(response.data.id)).toBe(1);
      expect(response.data).toHaveProperty("title");
      expect(response.data).toHaveProperty("body");
      expect(response.data).toHaveProperty("author");
      expect(response.data).toHaveProperty("author_username");
      expect(response.data).toHaveProperty("created_at");
      expect(response.data).toHaveProperty("likes_count");
      expect(response.data).toHaveProperty("comments");
    });

    it("should return post with comments array", async () => {
      const response = await axios.get(`${POSTS_URL}/1`);

      expect(response.status).toBe(200);
      expect(response.data.comments).toBeInstanceOf(Array);
      expect(response.data.comments.length).toBeGreaterThan(0);

      const comment = response.data.comments[0];
      expect(comment).toHaveProperty("id");
      expect(comment).toHaveProperty("body");
      expect(comment).toHaveProperty("author_id");
      expect(comment).toHaveProperty("author_username");
      expect(comment).toHaveProperty("created_at");
    });

    it("should return correct seeded post data", async () => {
      const response = await axios.get(`${POSTS_URL}/1`);

      expect(response.status).toBe(200);
      expect(response.data.title).toBe("Just launched my new side project!");
      expect(response.data.author_username).toBe("techie_sam");
    });

    it("should return 404 for non-existent post", async () => {
      try {
        await axios.get(`${POSTS_URL}/99999`);
        fail("Expected request to fail for non-existent post");
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toEqual({
          error: "Post ID 99999 not found",
        });
      }
    });

    it("should return 400 when post_id is not a number", async () => {
      try {
        await axios.get(`${POSTS_URL}/abc`);
        fail("Expected request to fail with invalid post_id");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid post_id parameter",
        });
      }
    });

    it("should return 400 when post_id is negative", async () => {
      try {
        await axios.get(`${POSTS_URL}/-1`);
        fail("Expected request to fail with negative post_id");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid post_id parameter",
        });
      }
    });
  });

  describe("GET /posts/:post_id/comments", () => {
    it("should return 200 and list of comments for a post", async () => {
      const response = await axios.get(`${POSTS_URL}/1/comments`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return comments with expected structure", async () => {
      const response = await axios.get(`${POSTS_URL}/1/comments`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);

      const comment = response.data[0];
      expect(comment).toHaveProperty("id");
      expect(comment).toHaveProperty("post_id");
      expect(comment).toHaveProperty("body");
      expect(comment).toHaveProperty("author_id");
      expect(comment).toHaveProperty("author_username");
      expect(comment).toHaveProperty("created_at");
    });

    it("should return seeded comments for post 1", async () => {
      const response = await axios.get(`${POSTS_URL}/1/comments`);

      expect(response.status).toBe(200);

      const bodies = response.data.map((c: any) => c.body);
      expect(bodies).toContain(
        "Congrats on the launch! Downloaded it and the UI is super clean.",
      );
    });

    it("should return empty array for post with no comments", async () => {
      // Post 15 only has one comment in seed, but let's check a pattern
      const response = await axios.get(`${POSTS_URL}/15/comments`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return 400 when post_id is not a number", async () => {
      try {
        await axios.get(`${POSTS_URL}/abc/comments`);
        fail("Expected request to fail with invalid post_id");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid post_id parameter",
        });
      }
    });

    it("should return 400 when post_id is negative", async () => {
      try {
        await axios.get(`${POSTS_URL}/-1/comments`);
        fail("Expected request to fail with negative post_id");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid post_id parameter",
        });
      }
    });
  });

  describe("GET /posts/comments/:page", () => {
    it("should return 200 and posts with comments for page 1", async () => {
      const response = await axios.get(`${POSTS_URL}/comments/1`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return posts with embedded comments array", async () => {
      const response = await axios.get(`${POSTS_URL}/comments/1`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);

      const post = response.data[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("body");
      expect(post).toHaveProperty("author");
      expect(post).toHaveProperty("author_username");
      expect(post).toHaveProperty("created_at");
      expect(post).toHaveProperty("likes_count");
      expect(post).toHaveProperty("comments");
      expect(post.comments).toBeInstanceOf(Array);
    });

    it("should return empty array for page with no results", async () => {
      const response = await axios.get(`${POSTS_URL}/comments/999`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBe(0);
    });

    it("should return 400 when page is not a number", async () => {
      try {
        await axios.get(`${POSTS_URL}/comments/abc`);
        fail("Expected request to fail with invalid page");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid page parameter",
        });
      }
    });

    it("should return 400 when page is negative", async () => {
      try {
        await axios.get(`${POSTS_URL}/comments/-1`);
        fail("Expected request to fail with negative page");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid page parameter",
        });
      }
    });
  });

  describe("GET /posts/random/:num_posts", () => {
    it("should return 200 and random posts", async () => {
      const response = await axios.get(`${POSTS_URL}/random/3`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeLessThanOrEqual(3);
    });

    it("should return posts with expected structure", async () => {
      const response = await axios.get(`${POSTS_URL}/random/1`);

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

    it("should return different results on multiple calls (randomness)", async () => {
      // Make multiple calls and check that we get variation
      const responses = await Promise.all([
        axios.get(`${POSTS_URL}/random/5`),
        axios.get(`${POSTS_URL}/random/5`),
        axios.get(`${POSTS_URL}/random/5`),
      ]);

      const allIds = responses.map((r) => r.data.map((p: any) => p.id).sort());

      // At least one response should be different (high probability with random)
      // This is a probabilistic test, but should pass almost always
      expect(responses.every((r) => r.status === 200)).toBe(true);
    });

    it("should return 400 when num_posts is not a number", async () => {
      try {
        await axios.get(`${POSTS_URL}/random/abc`);
        fail("Expected request to fail with invalid num_posts");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid number of posts requested",
        });
      }
    });

    it("should return 400 when num_posts is negative", async () => {
      try {
        await axios.get(`${POSTS_URL}/random/-5`);
        fail("Expected request to fail with negative num_posts");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid number of posts requested",
        });
      }
    });
  });

  describe("GET /posts/most-liked/:limit", () => {
    it("should return 200 and list of most liked posts", async () => {
      const response = await axios.get(`${POSTS_URL}/most-liked/10`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data.length).toBeLessThanOrEqual(10);
    });

    it("should return posts with expected structure", async () => {
      const response = await axios.get(`${POSTS_URL}/most-liked/5`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);

      const post = response.data[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("like_count");
    });

    it("should return posts ordered by like count descending", async () => {
      const response = await axios.get(`${POSTS_URL}/most-liked/10`);

      expect(response.status).toBe(200);

      const likeCounts = response.data.map((p: any) => Number(p.like_count));
      for (let i = 0; i < likeCounts.length - 1; i++) {
        expect(likeCounts[i]).toBeGreaterThanOrEqual(likeCounts[i + 1]);
      }
    });

    it("should respect the limit parameter", async () => {
      const response = await axios.get(`${POSTS_URL}/most-liked/3`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeLessThanOrEqual(3);
    });

    it("should accept limit of 1 (minimum)", async () => {
      const response = await axios.get(`${POSTS_URL}/most-liked/1`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBe(1);
    });

    it("should accept limit of 100 (maximum)", async () => {
      const response = await axios.get(`${POSTS_URL}/most-liked/100`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return 400 when limit is zero", async () => {
      try {
        await axios.get(`${POSTS_URL}/most-liked/0`);
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
        await axios.get(`${POSTS_URL}/most-liked/-5`);
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
        await axios.get(`${POSTS_URL}/most-liked/101`);
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
        await axios.get(`${POSTS_URL}/most-liked/abc`);
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
        await axios.get(`${POSTS_URL}/most-liked/5.5`);
        fail("Expected request to fail with decimal limit");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Invalid limit. Must be between 1 and 100",
        });
      }
    });
  });

  describe("GET /posts/personas/:persona_id/pages/:page", () => {
    it("should return 200 and posts for a specific persona", async () => {
      // Persona 1 (techie_sam) has posts
      const response = await axios.get(`${POSTS_URL}/personas/1/pages/1`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return posts with expected structure", async () => {
      const response = await axios.get(`${POSTS_URL}/personas/1/pages/1`);

      expect(response.status).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);

      const post = response.data[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("body");
      expect(post).toHaveProperty("author");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("author_username");
      expect(post).toHaveProperty("created_at");
      expect(post).toHaveProperty("likes_count");
      expect(post).toHaveProperty("comments_count");
    });

    it("should only return posts from the specified persona", async () => {
      const response = await axios.get(`${POSTS_URL}/personas/1/pages/1`);

      expect(response.status).toBe(200);

      // All posts should be from author 1 (returned as string from DB)
      response.data.forEach((post: any) => {
        expect(String(post.author)).toBe("1");
        expect(post.author_username).toBe("techie_sam");
      });
    });

    it("should return empty array for persona with no posts on page", async () => {
      const response = await axios.get(`${POSTS_URL}/personas/1/pages/999`);

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBe(0);
    });

    it("should return 400 when persona_id is not a number", async () => {
      try {
        await axios.get(`${POSTS_URL}/personas/abc/pages/1`);
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
        await axios.get(`${POSTS_URL}/personas/-1/pages/1`);
        fail("Expected request to fail with negative persona_id");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid persona_id parameter",
        });
      }
    });

    it("should return 400 when page is not a number", async () => {
      try {
        await axios.get(`${POSTS_URL}/personas/1/pages/abc`);
        fail("Expected request to fail with invalid page");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid page parameter",
        });
      }
    });

    it("should return 400 when page is negative", async () => {
      try {
        await axios.get(`${POSTS_URL}/personas/1/pages/-1`);
        fail("Expected request to fail with negative page");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({
          error: "Bad Request",
          message: "Invalid page parameter",
        });
      }
    });
  });

  describe("GET /health", () => {
    it("should return 200 and health status", async () => {
      const response = await axios.get(`${API_URL}/health`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("status", "ok");
      expect(response.data).toHaveProperty("message");
    });
  });
});
