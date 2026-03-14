import axios from "axios";
import { USER_SERVICE_URL } from "../../configs/urls.ts";

const USERS_URL = `${USER_SERVICE_URL}/api/v1/users`;

// Seed user data
const USER_1 = { id: "usr_01JKLMNO", username: "alex_dev", bio: "Full-stack dev. Building cool stuff." };
const USER_2 = { id: "usr_02PQRSTU", username: "jordan_adventures", bio: "Hiking, camping, and exploring the PNW." };

const authHeader = (userId: string) => ({
  headers: { Authorization: `Bearer ${userId}` },
});

describe("Users Endpoints", () => {
  describe("GET /api/v1/users/:id/stats", () => {
    it("should return 200 and user stats for a valid user", async () => {
      const response = await axios.get(`${USERS_URL}/${USER_1.id}/stats`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("followersCount");
      expect(response.data).toHaveProperty("followingCount");
      expect(response.data).toHaveProperty("postsCount");
    });

    it("should return numeric values for all stat fields", async () => {
      const response = await axios.get(`${USERS_URL}/${USER_1.id}/stats`);

      expect(response.status).toBe(200);
      expect(typeof response.data.followersCount).toBe("number");
      expect(typeof response.data.followingCount).toBe("number");
      expect(typeof response.data.postsCount).toBe("number");
    });

    it("should return stats with counts >= 0", async () => {
      const response = await axios.get(`${USERS_URL}/${USER_1.id}/stats`);

      expect(response.status).toBe(200);
      expect(response.data.followersCount).toBeGreaterThanOrEqual(0);
      expect(response.data.followingCount).toBeGreaterThanOrEqual(0);
      expect(response.data.postsCount).toBeGreaterThanOrEqual(0);
    });

    it("should return correct stats for user_1 based on seed data", async () => {
      const response = await axios.get(`${USERS_URL}/${USER_1.id}/stats`);

      expect(response.status).toBe(200);
      // usr_01JKLMNO has followers: usr_02PQRSTU, usr_03VWXYZA, usr_04BCDEFG, usr_05HIJKLM = 4
      expect(response.data.followersCount).toBe(4);
      // usr_01JKLMNO follows: 5 personas + 2 users = 7 total
      expect(response.data.followingCount).toBe(7);
      // usr_01JKLMNO authored posts 26 and 31 = 2
      expect(response.data.postsCount).toBe(2);
    });

    it("should not require authentication", async () => {
      const response = await axios.get(`${USERS_URL}/${USER_1.id}/stats`);

      expect(response.status).toBe(200);
    });

    it("should return 404 for non-existent user", async () => {
      try {
        await axios.get(`${USERS_URL}/nonexistent_user/stats`);
        fail("Expected error");
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe("PUT /api/v1/users/:id", () => {
    // Use user_2 for update tests to avoid conflicts with other tests
    const originalUser = { ...USER_2, imageUrl: "image_url.com" };

    afterAll(async () => {
      // Restore user_2 to original state
      try {
        await axios.put(
          `${USERS_URL}/${USER_2.id}`,
          {
            id: USER_2.id,
            username: USER_2.username,
            bio: USER_2.bio,
            imageUrl: originalUser.imageUrl,
          },
          authHeader(USER_2.id),
        );
      } catch {
        // Best effort cleanup
      }
    });

    it("should return 200 and updated user data when updating own profile", async () => {
      const updatedData = {
        id: USER_2.id,
        username: "jordan_updated",
        bio: "Updated bio for testing.",
        imageUrl: originalUser.imageUrl,
      };

      const response = await axios.put(
        `${USERS_URL}/${USER_2.id}`,
        updatedData,
        authHeader(USER_2.id),
      );

      expect(response.status).toBe(200);
      expect(response.data.username).toBe("jordan_updated");
      expect(response.data.bio).toBe("Updated bio for testing.");
    });

    it("should return 401 when trying to update another user's profile", async () => {
      const updatedData = {
        id: USER_1.id,
        username: "hacked_username",
        bio: "Hacked bio",
        imageUrl: "image_url.com",
      };

      try {
        await axios.put(
          `${USERS_URL}/${USER_1.id}`,
          updatedData,
          authHeader(USER_2.id),
        );
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it("should return 400 when body ID does not match path ID", async () => {
      const updatedData = {
        id: "mismatched_id",
        username: "new_name",
        bio: "New bio",
        imageUrl: "image_url.com",
      };

      try {
        await axios.put(
          `${USERS_URL}/${USER_2.id}`,
          updatedData,
          authHeader(USER_2.id),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when bio exceeds 200 characters", async () => {
      const updatedData = {
        id: USER_2.id,
        username: "jordan_adventures",
        bio: "a".repeat(201),
        imageUrl: "image_url.com",
      };

      try {
        await axios.put(
          `${USERS_URL}/${USER_2.id}`,
          updatedData,
          authHeader(USER_2.id),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when username exceeds 50 characters", async () => {
      const updatedData = {
        id: USER_2.id,
        username: "a".repeat(51),
        bio: "Valid bio",
        imageUrl: "image_url.com",
      };

      try {
        await axios.put(
          `${USERS_URL}/${USER_2.id}`,
          updatedData,
          authHeader(USER_2.id),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 401 when no authentication is provided", async () => {
      const updatedData = {
        id: USER_2.id,
        username: "no_auth",
        bio: "No auth bio",
        imageUrl: "image_url.com",
      };

      try {
        await axios.put(`${USERS_URL}/${USER_2.id}`, updatedData);
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("PATCH /api/v1/users/:id/bio", () => {
    const originalBio = USER_1.bio;

    afterAll(async () => {
      // Restore user_1 bio to original state
      try {
        await axios.patch(
          `${USERS_URL}/${USER_1.id}/bio`,
          { newBio: originalBio },
          authHeader(USER_1.id),
        );
      } catch {
        // Best effort cleanup
      }
    });

    it("should return 200 and updated user when patching bio", async () => {
      const response = await axios.patch(
        `${USERS_URL}/${USER_1.id}/bio`,
        { newBio: "Patched bio for integration test" },
        authHeader(USER_1.id),
      );

      expect(response.status).toBe(200);
      expect(response.data.bio).toBe("Patched bio for integration test");
      expect(response.data.id).toBe(USER_1.id);
    });

    it("should return 401 when patching another user's bio", async () => {
      try {
        await axios.patch(
          `${USERS_URL}/${USER_1.id}/bio`,
          { newBio: "Hacked bio" },
          authHeader(USER_2.id),
        );
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it("should return 400 when bio exceeds 200 characters", async () => {
      try {
        await axios.patch(
          `${USERS_URL}/${USER_1.id}/bio`,
          { newBio: "a".repeat(201) },
          authHeader(USER_1.id),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should accept bio at exactly 200 characters", async () => {
      const response = await axios.patch(
        `${USERS_URL}/${USER_1.id}/bio`,
        { newBio: "a".repeat(200) },
        authHeader(USER_1.id),
      );

      expect(response.status).toBe(200);
      expect(response.data.bio.length).toBe(200);
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.patch(`${USERS_URL}/${USER_1.id}/bio`, {
          newBio: "No auth",
        });
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });
});
