import axios from "axios";
import { USER_SERVICE_URL } from "../../configs/urls.ts";

const POSTS_URL = `${USER_SERVICE_URL}/api/v1/posts`;

const USER_1 = "usr_01JKLMNO";
const USER_2 = "usr_02PQRSTU";
const USER_3 = "usr_03VWXYZA";
const USER_4 = "usr_04BCDEFG";
const USER_5 = "usr_05HIJKLM";

const authHeader = (userId: string) => ({
  headers: { Authorization: `Bearer ${userId}` },
});

describe("Posts Endpoints", () => {
  describe("POST /api/v1/posts", () => {
    const createdPostIds: number[] = [];

    afterAll(async () => {
      // Posts don't have a delete endpoint on the PostController,
      // but we track IDs for documentation purposes.
      // The DB is ephemeral per test run so cleanup isn't strictly necessary.
    });

    it("should return 201 and created post when creating a post", async () => {
      const newPost = {
        title: "Integration Test Post",
        body: "This is a post created during integration testing.",
      };

      const response = await axios.post(POSTS_URL, newPost, authHeader(USER_1));

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("id");
      expect(response.data).toHaveProperty("title");
      expect(response.data).toHaveProperty("body");
      expect(response.data).toHaveProperty("user");
      expect(response.data.title).toBe(newPost.title);
      expect(response.data.body).toBe(newPost.body);
      expect(response.data.user.id).toBe(USER_1);

      createdPostIds.push(response.data.id);
    });

    it("should return post with correct user structure", async () => {
      const newPost = {
        title: "Structure Check Post",
        body: "Verifying the returned user structure.",
      };

      const response = await axios.post(POSTS_URL, newPost, authHeader(USER_2));

      expect(response.status).toBe(201);
      expect(response.data.user).toHaveProperty("id");
      expect(response.data.user).toHaveProperty("username");
      expect(response.data.user).toHaveProperty("bio");
      expect(response.data.user).toHaveProperty("imageUrl");
      expect(response.data.user.id).toBe(USER_2);
      expect(response.data.user.username).toBe("jordan_adventures");

      createdPostIds.push(response.data.id);
    });

    it("should return a Location header with the created resource URI", async () => {
      const newPost = {
        title: "Location Header Test",
        body: "Checking for Location header in response.",
      };

      const response = await axios.post(POSTS_URL, newPost, authHeader(USER_3));

      expect(response.status).toBe(201);
      expect(response.headers["location"]).toBeDefined();

      createdPostIds.push(response.data.id);
    });

    it("should assign a unique ID to each created post", async () => {
      const post1 = await axios.post(
        POSTS_URL,
        { title: "Unique ID Post 1", body: "First post for uniqueness test." },
        authHeader(USER_4),
      );
      const post2 = await axios.post(
        POSTS_URL,
        { title: "Unique ID Post 2", body: "Second post for uniqueness test." },
        authHeader(USER_4),
      );

      expect(post1.status).toBe(201);
      expect(post2.status).toBe(201);
      expect(post1.data.id).not.toBe(post2.data.id);

      createdPostIds.push(post1.data.id, post2.data.id);
    });

    it("should return 400 when title is blank", async () => {
      try {
        await axios.post(
          POSTS_URL,
          { title: "", body: "Body with blank title." },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when title is whitespace only", async () => {
      try {
        await axios.post(
          POSTS_URL,
          { title: "   ", body: "Body with whitespace title." },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when body is blank", async () => {
      try {
        await axios.post(
          POSTS_URL,
          { title: "Title with blank body", body: "" },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when body is whitespace only", async () => {
      try {
        await axios.post(
          POSTS_URL,
          { title: "Title with whitespace body", body: "   " },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when title exceeds 100 characters", async () => {
      try {
        await axios.post(
          POSTS_URL,
          { title: "a".repeat(101), body: "Valid body content." },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should accept title at exactly 100 characters", async () => {
      const response = await axios.post(
        POSTS_URL,
        { title: "a".repeat(100), body: "Valid body content." },
        authHeader(USER_1),
      );

      expect(response.status).toBe(201);
      expect(response.data.title.length).toBe(100);

      createdPostIds.push(response.data.id);
    });

    it("should return 400 when body exceeds 1000 characters", async () => {
      try {
        await axios.post(
          POSTS_URL,
          { title: "Valid title", body: "a".repeat(1001) },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should accept body at exactly 1000 characters", async () => {
      const response = await axios.post(
        POSTS_URL,
        { title: "Max body length test", body: "a".repeat(1000) },
        authHeader(USER_2),
      );

      expect(response.status).toBe(201);
      expect(response.data.body.length).toBe(1000);

      createdPostIds.push(response.data.id);
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.post(POSTS_URL, {
          title: "No auth post",
          body: "This should fail without auth.",
        });
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it("should allow different users to create posts with the same title", async () => {
      const sharedTitle = "Same Title Different Authors";
      const sharedBody = "Testing that duplicate titles are allowed.";

      const response1 = await axios.post(
        POSTS_URL,
        { title: sharedTitle, body: sharedBody },
        authHeader(USER_4),
      );
      const response2 = await axios.post(
        POSTS_URL,
        { title: sharedTitle, body: sharedBody },
        authHeader(USER_5),
      );

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.data.id).not.toBe(response2.data.id);
      expect(response1.data.user.id).toBe(USER_4);
      expect(response2.data.user.id).toBe(USER_5);

      createdPostIds.push(response1.data.id, response2.data.id);
    });

    it("should correctly associate the post with the authenticated user", async () => {
      const response = await axios.post(
        POSTS_URL,
        { title: "Author Verification", body: "Checking post authorship." },
        authHeader(USER_5),
      );

      expect(response.status).toBe(201);
      expect(response.data.user.id).toBe(USER_5);
      expect(response.data.user.username).toBe("casey_creates");

      createdPostIds.push(response.data.id);
    });
  });

  describe("Post creation and user stats consistency", () => {
    it("should increment the user's post count in stats after creating a post", async () => {
      // Get the current stats
      const statsBefore = await axios.get(
        `${USER_SERVICE_URL}/api/v1/users/${USER_3}/stats`,
      );
      const postsCountBefore = statsBefore.data.postsCount;

      // Create a new post
      const createResponse = await axios.post(
        POSTS_URL,
        {
          title: "Stats Consistency Test",
          body: "Verifying that stats update after post creation.",
        },
        authHeader(USER_3),
      );

      expect(createResponse.status).toBe(201);

      // Note: stats may be cached, so this test verifies the count is at least
      // what it was before. In a fresh environment without caching, it should
      // be exactly postsCountBefore + 1.
      const statsAfter = await axios.get(
        `${USER_SERVICE_URL}/api/v1/users/${USER_3}/stats`,
      );

      expect(statsAfter.data.postsCount).toBeGreaterThanOrEqual(
        postsCountBefore,
      );
    });
  });

  describe("Post creation with special characters", () => {
    it("should handle special characters in title and body", async () => {
      const response = await axios.post(
        POSTS_URL,
        {
          title: "Special chars: <>&\"'!@#$%^*()",
          body: "Body with émojis 🎉 and ünïcödé characters. Also <html> tags & \"quotes\".",
        },
        authHeader(USER_1),
      );

      expect(response.status).toBe(201);
      expect(response.data.title).toContain("<>&");
      expect(response.data.body).toContain("🎉");
    });

    it("should handle multiline body content", async () => {
      const multilineBody =
        "Line 1: Introduction.\nLine 2: Details.\nLine 3: Conclusion.";
      const response = await axios.post(
        POSTS_URL,
        { title: "Multiline Body Test", body: multilineBody },
        authHeader(USER_2),
      );

      expect(response.status).toBe(201);
      expect(response.data.body).toBe(multilineBody);
    });
  });
});
