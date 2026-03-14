import axios from "axios";
import { USER_SERVICE_URL } from "../../configs/urls.ts";

const COMMENTS_URL = `${USER_SERVICE_URL}/api/v1/comments`;

const USER_1 = "usr_01JKLMNO";
const USER_2 = "usr_02PQRSTU";
const USER_3 = "usr_03VWXYZA";
const USER_4 = "usr_04BCDEFG";
const USER_5 = "usr_05HIJKLM";

// Post IDs from seed data
const PERSONA_POST_1 = 1;
const PERSONA_POST_2 = 2;
const PERSONA_POST_5 = 5;
const USER_POST_26 = 26;
const USER_POST_27 = 27;

const authHeader = (userId: string) => ({
  headers: { Authorization: `Bearer ${userId}` },
});

describe("Comments Endpoints", () => {
  describe("POST /api/v1/comments", () => {
    let createdCommentId: number | null = null;

    afterAll(async () => {
      if (createdCommentId) {
        try {
          await axios.delete(
            `${COMMENTS_URL}/${createdCommentId}`,
            authHeader(USER_1),
          );
        } catch {
          // Best effort cleanup
        }
      }
    });

    it("should return 200 and created comment when posting a comment", async () => {
      const response = await axios.post(
        COMMENTS_URL,
        {
          postId: PERSONA_POST_2,
          body: "Great post! Integration test comment.",
        },
        authHeader(USER_1),
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("commentId");
      expect(response.data).toHaveProperty("postId");
      expect(response.data).toHaveProperty("commentAuthor");
      expect(response.data).toHaveProperty("body");
      expect(response.data.postId).toBe(PERSONA_POST_2);
      expect(response.data.body).toBe("Great post! Integration test comment.");
      expect(response.data.commentAuthor.id).toBe(USER_1);

      createdCommentId = response.data.commentId;
    });

    it("should return comment with correct author structure", async () => {
      const response = await axios.post(
        COMMENTS_URL,
        {
          postId: PERSONA_POST_5,
          body: "Another test comment for structure check.",
        },
        authHeader(USER_2),
      );

      expect(response.status).toBe(200);
      expect(response.data.commentAuthor).toHaveProperty("id");
      expect(response.data.commentAuthor).toHaveProperty("username");
      expect(response.data.commentAuthor).toHaveProperty("bio");
      expect(response.data.commentAuthor.id).toBe(USER_2);

      // Clean up
      try {
        await axios.delete(
          `${COMMENTS_URL}/${response.data.commentId}`,
          authHeader(USER_2),
        );
      } catch {
        // Best effort
      }
    });

    it("should return 400 when comment body is empty", async () => {
      try {
        await axios.post(
          COMMENTS_URL,
          { postId: PERSONA_POST_1, body: "" },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when comment body is whitespace only", async () => {
      try {
        await axios.post(
          COMMENTS_URL,
          { postId: PERSONA_POST_1, body: "   " },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when comment body exceeds 1000 characters", async () => {
      try {
        await axios.post(
          COMMENTS_URL,
          { postId: PERSONA_POST_1, body: "a".repeat(1001) },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should accept comment body at exactly 1000 characters", async () => {
      const response = await axios.post(
        COMMENTS_URL,
        { postId: PERSONA_POST_1, body: "a".repeat(1000) },
        authHeader(USER_3),
      );

      expect(response.status).toBe(200);
      expect(response.data.body.length).toBe(1000);

      // Clean up
      try {
        await axios.delete(
          `${COMMENTS_URL}/${response.data.commentId}`,
          authHeader(USER_3),
        );
      } catch {
        // Best effort
      }
    });

    it("should fail when posting to a non-existent post", async () => {
      try {
        await axios.post(
          COMMENTS_URL,
          { postId: 999999, body: "This post does not exist" },
          authHeader(USER_1),
        );
        fail("Expected error");
      } catch (error: any) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.post(COMMENTS_URL, {
          postId: PERSONA_POST_1,
          body: "No auth comment",
        });
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("PUT /api/v1/comments/:commentId", () => {
    let commentIdToUpdate: number | null = null;
    const originalBody = "Comment to be updated in integration test.";

    beforeAll(async () => {
      try {
        const response = await axios.post(
          COMMENTS_URL,
          { postId: USER_POST_26, body: originalBody },
          authHeader(USER_4),
        );
        commentIdToUpdate = response.data.commentId;
      } catch {
        // Setup failed
      }
    });

    afterAll(async () => {
      if (commentIdToUpdate) {
        try {
          await axios.delete(
            `${COMMENTS_URL}/${commentIdToUpdate}`,
            authHeader(USER_4),
          );
        } catch {
          // Best effort cleanup
        }
      }
    });

    it("should return 200 and updated comment when updating own comment", async () => {
      if (!commentIdToUpdate) {
        throw new Error("Setup failed: no comment created to update");
      }

      const updatedBody = "This comment has been updated!";
      const response = await axios.put(
        `${COMMENTS_URL}/${commentIdToUpdate}`,
        {
          commentId: commentIdToUpdate,
          postId: USER_POST_26,
          commentAuthor: {
            id: USER_4,
            username: "taylor_cooks",
            bio: "Aspiring chef.",
            imageUrl: "image_url.com",
          },
          body: updatedBody,
        },
        authHeader(USER_4),
      );

      expect(response.status).toBe(200);
      expect(response.data.body).toBe(updatedBody);
      expect(response.data.commentId).toBe(commentIdToUpdate);
      expect(response.data.commentAuthor.id).toBe(USER_4);
    });

    it("should return 401 when trying to update another user's comment", async () => {
      if (!commentIdToUpdate) {
        throw new Error("Setup failed: no comment created");
      }

      try {
        await axios.put(
          `${COMMENTS_URL}/${commentIdToUpdate}`,
          {
            commentId: commentIdToUpdate,
            postId: USER_POST_26,
            commentAuthor: {
              id: USER_1,
              username: "alex_dev",
              bio: "bio",
              imageUrl: "image_url.com",
            },
            body: "Trying to hijack this comment",
          },
          authHeader(USER_1),
        );
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it("should return 400 when commentId in path does not match body", async () => {
      if (!commentIdToUpdate) {
        throw new Error("Setup failed: no comment created");
      }

      try {
        await axios.put(
          `${COMMENTS_URL}/${commentIdToUpdate}`,
          {
            commentId: 999999,
            postId: USER_POST_26,
            commentAuthor: {
              id: USER_4,
              username: "taylor_cooks",
              bio: "bio",
              imageUrl: "image_url.com",
            },
            body: "Mismatched ID",
          },
          authHeader(USER_4),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 401 when no authentication is provided", async () => {
      if (!commentIdToUpdate) {
        throw new Error("Setup failed: no comment created");
      }

      try {
        await axios.put(`${COMMENTS_URL}/${commentIdToUpdate}`, {
          commentId: commentIdToUpdate,
          postId: USER_POST_26,
          commentAuthor: {
            id: USER_4,
            username: "taylor_cooks",
            bio: "bio",
            imageUrl: "image_url.com",
          },
          body: "No auth update",
        });
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("DELETE /api/v1/comments/:commentId", () => {
    let commentIdToDelete: number | null = null;

    beforeAll(async () => {
      try {
        const response = await axios.post(
          COMMENTS_URL,
          { postId: USER_POST_27, body: "This comment will be deleted." },
          authHeader(USER_5),
        );
        commentIdToDelete = response.data.commentId;
      } catch {
        // Setup failed
      }
    });

    it("should successfully delete own comment", async () => {
      if (!commentIdToDelete) {
        throw new Error("Setup failed: no comment created to delete");
      }

      const response = await axios.delete(
        `${COMMENTS_URL}/${commentIdToDelete}`,
        authHeader(USER_5),
      );

      expect(response.status).toBe(200);
    });

    it("should return 401 when trying to delete another user's comment", async () => {
      // Create a comment by USER_3 to try to delete as USER_4
      const createResponse = await axios.post(
        COMMENTS_URL,
        {
          postId: PERSONA_POST_1,
          body: "Comment by user_3 for delete auth test.",
        },
        authHeader(USER_3),
      );

      const commentId = createResponse.data.commentId;

      try {
        await axios.delete(`${COMMENTS_URL}/${commentId}`, authHeader(USER_4));
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }

      // Clean up
      try {
        await axios.delete(`${COMMENTS_URL}/${commentId}`, authHeader(USER_3));
      } catch {
        // Best effort
      }
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.delete(`${COMMENTS_URL}/1`);
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("Comment lifecycle — create, update, delete", () => {
    let commentId: number;
    const targetPost = PERSONA_POST_5;

    it("should create a new comment", async () => {
      const response = await axios.post(
        COMMENTS_URL,
        { postId: targetPost, body: "Lifecycle test: original comment." },
        authHeader(USER_2),
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("commentId");
      expect(response.data.body).toBe("Lifecycle test: original comment.");
      expect(response.data.postId).toBe(targetPost);

      commentId = response.data.commentId;
    });

    it("should update the comment", async () => {
      const updatedBody = "Lifecycle test: updated comment.";
      const response = await axios.put(
        `${COMMENTS_URL}/${commentId}`,
        {
          commentId: commentId,
          postId: targetPost,
          commentAuthor: {
            id: USER_2,
            username: "jordan_adventures",
            bio: "bio",
            imageUrl: "image_url.com",
          },
          body: updatedBody,
        },
        authHeader(USER_2),
      );

      expect(response.status).toBe(200);
      expect(response.data.body).toBe(updatedBody);
      expect(response.data.commentId).toBe(commentId);
    });

    it("should delete the comment", async () => {
      const response = await axios.delete(
        `${COMMENTS_URL}/${commentId}`,
        authHeader(USER_2),
      );

      expect(response.status).toBe(200);
    });
  });

  describe("Multiple comments on same post", () => {
    const commentIds: number[] = [];
    const targetPost = USER_POST_26;

    afterAll(async () => {
      for (const id of commentIds) {
        try {
          await axios.delete(`${COMMENTS_URL}/${id}`, authHeader(USER_3));
        } catch {
          // Best effort
        }
      }
    });

    it("should allow the same user to comment multiple times on a post", async () => {
      const response1 = await axios.post(
        COMMENTS_URL,
        { postId: targetPost, body: "First comment on this post." },
        authHeader(USER_3),
      );

      expect(response1.status).toBe(200);
      commentIds.push(response1.data.commentId);

      const response2 = await axios.post(
        COMMENTS_URL,
        { postId: targetPost, body: "Second comment on this post." },
        authHeader(USER_3),
      );

      expect(response2.status).toBe(200);
      commentIds.push(response2.data.commentId);

      expect(response1.data.commentId).not.toBe(response2.data.commentId);
    });
  });
});
