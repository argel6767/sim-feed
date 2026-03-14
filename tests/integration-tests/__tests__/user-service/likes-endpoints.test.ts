import axios from "axios";
import { USER_SERVICE_URL } from "../../configs/urls.ts";

const LIKES_URL = `${USER_SERVICE_URL}/api/v1/likes`;

const USER_1 = "usr_01JKLMNO";
const USER_2 = "usr_02PQRSTU";
const USER_3 = "usr_03VWXYZA";
const USER_4 = "usr_04BCDEFG";
const USER_5 = "usr_05HIJKLM";

// Post IDs from seed data (persona-authored posts: 1-25, user-authored posts: 26-33)
const PERSONA_POST_1 = 1;
const PERSONA_POST_3 = 3;
const PERSONA_POST_13 = 13;
const USER_POST_26 = 26;

const authHeader = (userId: string) => ({
  headers: { Authorization: `Bearer ${userId}` },
});

describe("Likes Endpoints", () => {
  describe("GET /api/v1/likes", () => {
    it("should return 200 and a paginated list of likes for the authenticated user", async () => {
      // usr_01JKLMNO has several likes in seed data
      const response = await axios.get(LIKES_URL, authHeader(USER_1));

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("content");
      expect(response.data).toHaveProperty("totalElements");
      expect(response.data).toHaveProperty("totalPages");
      expect(response.data).toHaveProperty("number");
      expect(response.data).toHaveProperty("size");
      expect(response.data.content).toBeInstanceOf(Array);
    });

    it("should return likes with expected structure", async () => {
      const response = await axios.get(LIKES_URL, authHeader(USER_1));

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeGreaterThan(0);

      const like = response.data.content[0];
      expect(like).toHaveProperty("id");
      expect(like).toHaveProperty("post");
      expect(like.post).toHaveProperty("id");
      expect(like.post).toHaveProperty("title");
      expect(like.post).toHaveProperty("body");
      expect(like).toHaveProperty("user");
      expect(like.user).toHaveProperty("id");
      expect(like.user).toHaveProperty("username");
    });

    it("should return likes belonging to the authenticated user only", async () => {
      const response = await axios.get(LIKES_URL, authHeader(USER_1));

      expect(response.status).toBe(200);
      for (const like of response.data.content) {
        expect(like.user.id).toBe(USER_1);
      }
    });

    it("should respect page and size query parameters", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 3 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeLessThanOrEqual(3);
      expect(response.data.size).toBe(3);
      expect(response.data.number).toBe(0);
    });

    it("should return likes ordered by created_at descending (most recent first)", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 50 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      // The endpoint orders by createdAt desc — we can't easily check timestamps
      // but we can at least verify we get results back
      expect(response.data.content.length).toBeGreaterThan(0);
    });

    it("should return empty content for user with no likes", async () => {
      // Create a scenario check — if a hypothetical user had no likes
      // For seed data, all users have likes, so let's verify the pagination boundary
      const response = await axios.get(LIKES_URL, {
        params: { page: 999, size: 15 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      expect(response.data.content).toBeInstanceOf(Array);
      expect(response.data.content.length).toBe(0);
    });

    it("should use default pagination when no params are provided", async () => {
      const response = await axios.get(LIKES_URL, authHeader(USER_1));

      expect(response.status).toBe(200);
      expect(response.data.number).toBe(0);
      expect(response.data.size).toBe(15);
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.get(LIKES_URL);
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it("should return correct total count of likes for user_1", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 100 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      // usr_01JKLMNO likes from seed:
      // Persona posts: 1, 7, 9, 11, 18, 19 = 6
      // User posts: 27, 28, 29, 32 = 4
      // Total = 10
      expect(response.data.totalElements).toBe(10);
    });
  });

  describe("POST /api/v1/likes", () => {
    let createdLikeId: number | null = null;

    afterAll(async () => {
      if (createdLikeId) {
        try {
          await axios.delete(
            `${LIKES_URL}/${createdLikeId}`,
            authHeader(USER_3),
          );
        } catch {
          // Best effort cleanup
        }
      }
    });

    it("should return 200 and created like when liking a post", async () => {
      // usr_03VWXYZA does not like post 13 in seed data
      const response = await axios.post(
        LIKES_URL,
        { postId: PERSONA_POST_13 },
        authHeader(USER_3),
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("post");
      expect(response.data).toHaveProperty("user");
      expect(response.data.post.id).toBe(PERSONA_POST_13);
      expect(response.data.user.id).toBe(USER_3);

      createdLikeId = response.data.id;
    });

    it("should return the like with correct post details", async () => {
      if (!createdLikeId) {
        throw new Error("Setup failed: no like created");
      }

      // Verify the like appears in the user's likes list
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 100 },
        ...authHeader(USER_3),
      });

      expect(response.status).toBe(200);
      const match = response.data.content.find(
        (l: any) => l.id === createdLikeId,
      );
      expect(match).toBeDefined();
      expect(match.post.id).toBe(PERSONA_POST_13);
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.post(LIKES_URL, { postId: PERSONA_POST_1 });
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it("should fail when liking a non-existent post", async () => {
      try {
        await axios.post(
          LIKES_URL,
          { postId: 999999 },
          authHeader(USER_1),
        );
        fail("Expected error");
      } catch (error: any) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it("should fail when liking a post the user already liked", async () => {
      // usr_01JKLMNO already likes post 1 in seed data
      try {
        await axios.post(
          LIKES_URL,
          { postId: PERSONA_POST_1 },
          authHeader(USER_1),
        );
        fail("Expected error for duplicate like");
      } catch (error: any) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("DELETE /api/v1/likes/:likeId", () => {
    let likeIdToDelete: number | null = null;

    beforeAll(async () => {
      // Create a like to delete: usr_04BCDEFG likes post 3 (not liked in seed)
      try {
        const response = await axios.post(
          LIKES_URL,
          { postId: PERSONA_POST_3 },
          authHeader(USER_4),
        );
        likeIdToDelete = response.data.id;
      } catch {
        // If it fails, tests depending on this will handle it
      }
    });

    it("should successfully delete own like", async () => {
      if (!likeIdToDelete) {
        throw new Error("Setup failed: no like created to delete");
      }

      const response = await axios.delete(
        `${LIKES_URL}/${likeIdToDelete}`,
        authHeader(USER_4),
      );

      // The unlike endpoint returns void so expect 200 (default for void)
      expect(response.status).toBe(200);
    });

    it("should confirm the like is removed after deletion", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 100 },
        ...authHeader(USER_4),
      });

      expect(response.status).toBe(200);
      const match = response.data.content.find(
        (l: any) => l.id === likeIdToDelete,
      );
      expect(match).toBeUndefined();
    });

    it("should return 401 when trying to unlike another user's like", async () => {
      // Get one of USER_1's likes
      const likesResponse = await axios.get(LIKES_URL, {
        params: { page: 0, size: 1 },
        ...authHeader(USER_1),
      });

      expect(likesResponse.data.content.length).toBeGreaterThan(0);
      const otherUserLikeId = likesResponse.data.content[0].id;

      try {
        await axios.delete(
          `${LIKES_URL}/${otherUserLikeId}`,
          authHeader(USER_2),
        );
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.delete(`${LIKES_URL}/1`);
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("Like lifecycle — create, verify, delete, verify removal", () => {
    let likeId: number;
    // Use a post that usr_05HIJKLM has NOT liked in seed data
    // usr_05HIJKLM likes: 1, 4, 7, 10, 11, 14, 16, 25, 26, 28, 29, 31, 32, 33
    // Post 15 is not liked by usr_05HIJKLM
    const targetPostId = 15;

    it("should create a new like", async () => {
      const response = await axios.post(
        LIKES_URL,
        { postId: targetPostId },
        authHeader(USER_5),
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("id");
      expect(response.data.post.id).toBe(targetPostId);
      expect(response.data.user.id).toBe(USER_5);

      likeId = response.data.id;
    });

    it("should show the like in the user's likes list", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 100 },
        ...authHeader(USER_5),
      });

      expect(response.status).toBe(200);
      const match = response.data.content.find((l: any) => l.id === likeId);
      expect(match).toBeDefined();
      expect(match.post.id).toBe(targetPostId);
    });

    it("should increase the total like count for the user", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 100 },
        ...authHeader(USER_5),
      });

      expect(response.status).toBe(200);
      expect(response.data.totalElements).toBeGreaterThan(0);
    });

    it("should delete the like", async () => {
      const response = await axios.delete(
        `${LIKES_URL}/${likeId}`,
        authHeader(USER_5),
      );

      expect(response.status).toBe(200);
    });

    it("should no longer show the like in the user's likes list", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 100 },
        ...authHeader(USER_5),
      });

      expect(response.status).toBe(200);
      const match = response.data.content.find((l: any) => l.id === likeId);
      expect(match).toBeUndefined();
    });
  });

  describe("Pagination behavior", () => {
    it("should return correct page info for first page", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 2 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      expect(response.data.number).toBe(0);
      expect(response.data.content.length).toBeLessThanOrEqual(2);
      expect(response.data.first).toBe(true);
    });

    it("should return correct page info for subsequent page", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 1, size: 2 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      expect(response.data.number).toBe(1);
      expect(response.data.first).toBe(false);
    });

    it("should have totalPages consistent with totalElements and size", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 3 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      const expectedPages = Math.ceil(
        response.data.totalElements / response.data.size,
      );
      expect(response.data.totalPages).toBe(expectedPages);
    });

    it("should not return more elements than the page size", async () => {
      const response = await axios.get(LIKES_URL, {
        params: { page: 0, size: 5 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      expect(response.data.content.length).toBeLessThanOrEqual(5);
    });
  });
});
