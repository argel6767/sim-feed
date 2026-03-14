import axios from "axios";
import { USER_SERVICE_URL } from "../../configs/urls.ts";

const FOLLOWS_URL = `${USER_SERVICE_URL}/api/v1/follows`;

const USER_1 = "usr_01JKLMNO";
const USER_2 = "usr_02PQRSTU";
const USER_3 = "usr_03VWXYZA";
const USER_4 = "usr_04BCDEFG";
const USER_5 = "usr_05HIJKLM";

const authHeader = (userId: string) => ({
  headers: { Authorization: `Bearer ${userId}` },
});

describe("Follows Endpoints", () => {
  describe("GET /api/v1/follows/users/:userId/follows", () => {
    it("should return 200 and list of follows for a user", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/follows`,
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return follows with expected structure", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/follows`,
      );

      expect(response.status).toBe(200);
      const follow = response.data[0];
      expect(follow).toHaveProperty("id");
      expect(follow).toHaveProperty("follower");
      expect(follow.follower).toHaveProperty("id");
      expect(follow.follower).toHaveProperty("username");
    });

    it("should return follows where follower is the specified user", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/follows`,
      );

      expect(response.status).toBe(200);
      for (const follow of response.data) {
        expect(follow.follower.id).toBe(USER_1);
      }
    });

    it("should include both user follows and persona follows for user_1", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/follows`,
      );

      expect(response.status).toBe(200);
      const userFollows = response.data.filter(
        (f: any) => f.userFollowed !== null,
      );
      const personaFollows = response.data.filter(
        (f: any) => f.personaFollowed !== null,
      );

      // usr_01JKLMNO follows 2 users and 5 personas in seed data
      expect(userFollows.length).toBe(2);
      expect(personaFollows.length).toBe(5);
    });

    it("should not require authentication", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/follows`,
      );

      expect(response.status).toBe(200);
    });

    it("should return empty array for user with no follows", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/nonexistent_user/follows`,
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBe(0);
    });
  });

  describe("GET /api/v1/follows/users/:userId/followers", () => {
    it("should return 200 and list of followers for a user", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/followers`,
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it("should return followers with expected structure", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/followers`,
      );

      expect(response.status).toBe(200);
      const follow = response.data[0];
      expect(follow).toHaveProperty("id");
      expect(follow).toHaveProperty("follower");
      expect(follow).toHaveProperty("userFollowed");
      expect(follow.follower).toHaveProperty("id");
      expect(follow.follower).toHaveProperty("username");
    });

    it("should return followers with the followed user matching the path parameter", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/followers`,
      );

      expect(response.status).toBe(200);
      for (const follow of response.data) {
        expect(follow.userFollowed.id).toBe(USER_1);
      }
    });

    it("should return correct number of followers for user_1", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/followers`,
      );

      expect(response.status).toBe(200);
      // usr_01JKLMNO is followed by usr_02, usr_03, usr_04, usr_05
      expect(response.data.length).toBe(4);
    });

    it("should not require authentication", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_2}/followers`,
      );

      expect(response.status).toBe(200);
    });

    it("should return empty array for user with no followers", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/nonexistent_user/followers`,
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBe(0);
    });
  });

  describe("GET /api/v1/follows/is-following", () => {
    it("should return true when user is following another user", async () => {
      // usr_01JKLMNO follows usr_02PQRSTU
      const response = await axios.get(`${FOLLOWS_URL}/is-following`, {
        params: { userId: USER_2 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      expect(response.data.isFollowing).toBe(true);
      expect(response.data.followId).toBeDefined();
      expect(typeof response.data.followId).toBe("number");
    });

    it("should return false when user is not following another user", async () => {
      // usr_01JKLMNO does not follow usr_04BCDEFG
      const response = await axios.get(`${FOLLOWS_URL}/is-following`, {
        params: { userId: USER_4 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      expect(response.data.isFollowing).toBe(false);
    });

    it("should return true when user is following a persona", async () => {
      // usr_01JKLMNO follows persona 1
      const response = await axios.get(`${FOLLOWS_URL}/is-following`, {
        params: { personaId: 1 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      expect(response.data.isFollowing).toBe(true);
      expect(response.data.followId).toBeDefined();
    });

    it("should return false when user is not following a persona", async () => {
      // usr_01JKLMNO does not follow persona 2
      const response = await axios.get(`${FOLLOWS_URL}/is-following`, {
        params: { personaId: 2 },
        ...authHeader(USER_1),
      });

      expect(response.status).toBe(200);
      expect(response.data.isFollowing).toBe(false);
    });

    it("should return 400 when neither userId nor personaId is provided", async () => {
      try {
        await axios.get(`${FOLLOWS_URL}/is-following`, authHeader(USER_1));
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when both userId and personaId are provided", async () => {
      try {
        await axios.get(`${FOLLOWS_URL}/is-following`, {
          params: { userId: USER_2, personaId: 1 },
          ...authHeader(USER_1),
        });
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.get(`${FOLLOWS_URL}/is-following`, {
          params: { userId: USER_2 },
        });
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("POST /api/v1/follows — follow a user", () => {
    let createdUserFollowId: number | null = null;

    afterAll(async () => {
      if (createdUserFollowId) {
        try {
          await axios.delete(
            `${FOLLOWS_URL}/${createdUserFollowId}`,
            authHeader(USER_3),
          );
        } catch {
          // Best effort cleanup
        }
      }
    });

    it("should return 201 when following another user", async () => {
      // usr_03VWXYZA does not follow usr_02PQRSTU in seed data
      const response = await axios.post(
        FOLLOWS_URL,
        { userId: USER_2 },
        authHeader(USER_3),
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("id");
      expect(response.data.follower.id).toBe(USER_3);
      expect(response.data.userFollowed.id).toBe(USER_2);
      expect(response.data.personaFollowed).toBeNull();

      createdUserFollowId = response.data.id;
    });

    it("should return 400 when trying to follow yourself", async () => {
      try {
        await axios.post(
          FOLLOWS_URL,
          { userId: USER_1 },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when neither userId nor personaId is provided", async () => {
      try {
        await axios.post(FOLLOWS_URL, {}, authHeader(USER_1));
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 400 when both userId and personaId are provided", async () => {
      try {
        await axios.post(
          FOLLOWS_URL,
          { userId: USER_2, personaId: 1 },
          authHeader(USER_1),
        );
        fail("Expected 400 error");
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.post(FOLLOWS_URL, { userId: USER_2 });
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("POST /api/v1/follows — follow a persona", () => {
    let createdPersonaFollowId: number | null = null;

    afterAll(async () => {
      if (createdPersonaFollowId) {
        try {
          await axios.delete(
            `${FOLLOWS_URL}/${createdPersonaFollowId}`,
            authHeader(USER_4),
          );
        } catch {
          // Best effort cleanup
        }
      }
    });

    it("should return 201 when following a persona", async () => {
      // usr_04BCDEFG does not follow persona 1 in seed data
      const response = await axios.post(
        FOLLOWS_URL,
        { personaId: 1 },
        authHeader(USER_4),
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("id");
      expect(response.data.follower.id).toBe(USER_4);
      expect(response.data.personaFollowed).toBeDefined();
      expect(response.data.personaFollowed).not.toBeNull();
      expect(response.data.userFollowed).toBeNull();

      createdPersonaFollowId = response.data.id;
    });
  });

  describe("DELETE /api/v1/follows/:userFollowId", () => {
    let followIdToDelete: number | null = null;

    beforeAll(async () => {
      // Create a follow to delete: usr_04BCDEFG follows usr_03VWXYZA (not in seed)
      // usr_03VWXYZA follows usr_04BCDEFG in seed, but not the reverse
      try {
        const response = await axios.post(
          FOLLOWS_URL,
          { userId: USER_3 },
          authHeader(USER_4),
        );
        followIdToDelete = response.data.id;
      } catch {
        // If already exists, skip
      }
    });

    it("should return 204 when deleting own follow", async () => {
      if (!followIdToDelete) {
        throw new Error("Setup failed: no follow created to delete");
      }

      const response = await axios.delete(
        `${FOLLOWS_URL}/${followIdToDelete}`,
        authHeader(USER_4),
      );

      expect(response.status).toBe(204);
    });

    it("should return 403 when deleting another user's follow", async () => {
      // Get an existing follow for USER_1
      const followsResponse = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/follows`,
      );

      expect(followsResponse.data.length).toBeGreaterThan(0);
      const followId = followsResponse.data[0].id;

      try {
        await axios.delete(
          `${FOLLOWS_URL}/${followId}`,
          authHeader(USER_2),
        );
        fail("Expected 403 error");
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });

    it("should return 404 when deleting a non-existent follow", async () => {
      try {
        await axios.delete(
          `${FOLLOWS_URL}/999999`,
          authHeader(USER_1),
        );
        fail("Expected 404 error");
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it("should return 401 when no authentication is provided", async () => {
      try {
        await axios.delete(`${FOLLOWS_URL}/1`);
        fail("Expected 401 error");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("Follow lifecycle — create, verify, delete, verify removal", () => {
    let followId: number;

    it("should create a new user follow", async () => {
      // usr_02PQRSTU does not follow usr_04BCDEFG in seed data
      const response = await axios.post(
        FOLLOWS_URL,
        { userId: USER_4 },
        authHeader(USER_2),
      );

      expect(response.status).toBe(201);
      followId = response.data.id;
      expect(followId).toBeDefined();
    });

    it("should confirm the follow via is-following", async () => {
      const response = await axios.get(`${FOLLOWS_URL}/is-following`, {
        params: { userId: USER_4 },
        ...authHeader(USER_2),
      });

      expect(response.status).toBe(200);
      expect(response.data.isFollowing).toBe(true);
      expect(response.data.followId).toBe(followId);
    });

    it("should show the follow in the user's follows list", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_2}/follows`,
      );

      expect(response.status).toBe(200);
      const match = response.data.find((f: any) => f.id === followId);
      expect(match).toBeDefined();
      expect(match.userFollowed.id).toBe(USER_4);
    });

    it("should show the follow in the target user's followers list", async () => {
      const response = await axios.get(
        `${FOLLOWS_URL}/users/${USER_4}/followers`,
      );

      expect(response.status).toBe(200);
      const match = response.data.find((f: any) => f.id === followId);
      expect(match).toBeDefined();
      expect(match.follower.id).toBe(USER_2);
    });

    it("should delete the follow", async () => {
      const response = await axios.delete(
        `${FOLLOWS_URL}/${followId}`,
        authHeader(USER_2),
      );

      expect(response.status).toBe(204);
    });

    it("should confirm the follow is removed via is-following", async () => {
      const response = await axios.get(`${FOLLOWS_URL}/is-following`, {
        params: { userId: USER_4 },
        ...authHeader(USER_2),
      });

      expect(response.status).toBe(200);
      expect(response.data.isFollowing).toBe(false);
    });
  });

  describe("Cross-endpoint consistency", () => {
    it("should have consistent follower count between followers list and user stats", async () => {
      const followersResponse = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/followers`,
      );
      const statsResponse = await axios.get(
        `${USER_SERVICE_URL}/api/v1/users/${USER_1}/stats`,
      );

      expect(followersResponse.status).toBe(200);
      expect(statsResponse.status).toBe(200);

      expect(followersResponse.data.length).toBe(
        statsResponse.data.followersCount,
      );
    });

    it("should have consistent following count between follows list and user stats", async () => {
      const followsResponse = await axios.get(
        `${FOLLOWS_URL}/users/${USER_1}/follows`,
      );
      const statsResponse = await axios.get(
        `${USER_SERVICE_URL}/api/v1/users/${USER_1}/stats`,
      );

      expect(followsResponse.status).toBe(200);
      expect(statsResponse.status).toBe(200);

      expect(followsResponse.data.length).toBe(
        statsResponse.data.followingCount,
      );
    });
  });
});
