import axios from 'axios';
import { SCHEDULER_ENGINE_URL } from '../../configs/urls.ts';
import { ADMIN_CREDS } from '../../setupTests.ts';

const PERSONAS_URL = `${SCHEDULER_ENGINE_URL}/personas`;

/**
 * Helper function to create axios config with auth header
 */
function authConfig(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

describe("Personas Endpoints", () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token before running tests
    authToken = await ADMIN_CREDS.auth_token;
  });

  describe("Authentication Required", () => {
    it("should return 401/403 for GET /personas without auth token", async () => {
      try {
        await axios.get(PERSONAS_URL);
        fail("Expected request to fail without auth");
      } catch (error) {
        // FastAPI OAuth2 returns 401 for missing token
        expect([401, 403]).toContain(error.response.status);
      }
    });

    it("should return 401/403 for POST /personas without auth token", async () => {
      const payload = {
        username: "test_user",
        persona: "Test persona",
        bio: "Test bio",
      };

      try {
        await axios.post(PERSONAS_URL, payload);
        fail("Expected request to fail without auth");
      } catch (error) {
        expect([401, 403]).toContain(error.response.status);
      }
    });

    it("should return 401/403 for GET /personas/{id} without auth token", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/1`);
        fail("Expected request to fail without auth");
      } catch (error) {
        expect([401, 403]).toContain(error.response.status);
      }
    });

    it("should return 401/403 for GET /personas/username/{username} without auth token", async () => {
      try {
        await axios.get(`${PERSONAS_URL}/username/techie_sam`);
        fail("Expected request to fail without auth");
      } catch (error) {
        expect([401, 403]).toContain(error.response.status);
      }
    });

    it("should return 401/403 for DELETE /personas/{id} without auth token", async () => {
      try {
        await axios.delete(`${PERSONAS_URL}/1`);
        fail("Expected request to fail without auth");
      } catch (error) {
        expect([401, 403]).toContain(error.response.status);
      }
    });

    it("should return 403 for requests with invalid auth token", async () => {
      const invalidConfig = {
        headers: {
          Authorization: "Bearer invalid_token_value",
        },
      };

      try {
        await axios.get(PERSONAS_URL, invalidConfig);
        fail("Expected request to fail with invalid auth");
      } catch (error) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.detail).toContain("Invalid credentials");
      }
    });
  });

  describe("GET /personas", () => {
    it("should return 200 and list of personas with valid auth", async () => {
      const response = await axios.get(PERSONAS_URL, authConfig(authToken));

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("should return personas with expected structure", async () => {
      const response = await axios.get(PERSONAS_URL, authConfig(authToken));

      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);

      const persona = response.data[0];
      expect(persona).toHaveProperty("persona_id");
      expect(persona).toHaveProperty("username");
    });

    it("should return seeded personas from database", async () => {
      const response = await axios.get(PERSONAS_URL, authConfig(authToken));

      expect(response.status).toBe(200);

      const usernames = response.data.map((p) => p.username);
      // Check for some seeded personas
      expect(usernames).toContain("techie_sam");
      expect(usernames).toContain("wanderlust_emma");
      expect(usernames).toContain("fit_marcus");
    });
  });

  describe("GET /personas/{id}", () => {
    it("should return 200 and persona data for valid ID", async () => {
      const response = await axios.get(
        `${PERSONAS_URL}/1`,
        authConfig(authToken),
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("persona_id");
      expect(response.data.persona_id).toBe(1);
      expect(response.data).toHaveProperty("username");
      expect(response.data.username).toBe("techie_sam");
    });

    it("should return correct persona data for different IDs", async () => {
      const response = await axios.get(
        `${PERSONAS_URL}/2`,
        authConfig(authToken),
      );

      expect(response.status).toBe(200);
      expect(response.data.persona_id).toBe(2);
      expect(response.data.username).toBe("wanderlust_emma");
    });

    it("should return 404 for non-existent persona ID", async () => {
      const nonExistentId = 99999;

      try {
        await axios.get(
          `${PERSONAS_URL}/${nonExistentId}`,
          authConfig(authToken),
        );
        fail("Expected request to fail with 404");
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.detail).toContain(
          `Persona with id ${nonExistentId} not found`,
        );
      }
    });

    it("should return persona with bio and description fields", async () => {
      const response = await axios.get(
        `${PERSONAS_URL}/1`,
        authConfig(authToken),
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("bio");
      expect(response.data).toHaveProperty("description");
      expect(response.data.bio).toBe("Tech enthusiast and coffee addict ☕");
    });
  });

  describe("GET /personas/username/{username}", () => {
    it("should return 200 and persona data for valid username", async () => {
      const response = await axios.get(
        `${PERSONAS_URL}/username/techie_sam`,
        authConfig(authToken),
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("username");
      expect(response.data.username).toBe("techie_sam");
      expect(response.data).toHaveProperty("persona_id");
    });

    it("should return correct data for different usernames", async () => {
      const response = await axios.get(
        `${PERSONAS_URL}/username/artsy_luna`,
        authConfig(authToken),
      );

      expect(response.status).toBe(200);
      expect(response.data.username).toBe("artsy_luna");
      expect(response.data.bio).toBe("Art is my therapy 🎨");
    });

    it("should return 404 for non-existent username", async () => {
      const nonExistentUsername = "non_existent_user_xyz123";

      try {
        await axios.get(
          `${PERSONAS_URL}/username/${nonExistentUsername}`,
          authConfig(authToken),
        );
        fail("Expected request to fail with 404");
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.detail).toContain(
          `Persona with username ${nonExistentUsername} not found`,
        );
      }
    });

    it("should handle special characters in username search", async () => {
      const usernameWithUnderscore = "green_thumb_nina";
      const response = await axios.get(
        `${PERSONAS_URL}/username/${usernameWithUnderscore}`,
        authConfig(authToken),
      );

      expect(response.status).toBe(200);
      expect(response.data.username).toBe(usernameWithUnderscore);
    });
  });

  describe("POST /personas", () => {
    it("should return 201 and create new persona with valid data", async () => {
      const payload = {
        username: "integration_test_user_" + Date.now(),
        persona: "Integration test persona description",
        bio: "Integration test bio",
      };

      const response = await axios.post(
        PERSONAS_URL,
        payload,
        authConfig(authToken),
      );

      expect(response.status).toBe(201);
      const getResponse = await axios.get(`${PERSONAS_URL}/username/${payload.username}`,authConfig(authToken),);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data).toHaveProperty("persona_id");
      expect(getResponse.data).toHaveProperty("username");
      expect(getResponse.data).toHaveProperty("description");
      expect(getResponse.data).toHaveProperty("bio");
      expect(getResponse.data).toHaveProperty("created_at");
      expect(getResponse.data.username).toBe(payload.username);
      expect(getResponse.data.description).toBe(payload.persona);
      expect(getResponse.data.bio).toBe(payload.bio);
    });

    it("should return 400 when request body is empty", async () => {
      try {
        await axios.post(PERSONAS_URL, {}, authConfig(authToken));
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "failure in inserting new persona",
        );
      }
    });

    it("should return 400 when username is missing", async () => {
      const payload = {
        persona: "Test persona description",
        bio: "Test bio",
      };

      try {
        await axios.post(PERSONAS_URL, payload, authConfig(authToken));
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "failure in inserting new persona",
        );
      }
    });

    it("should return 400 when persona description is missing", async () => {
      const payload = {
        username: "test_user_no_persona_" + Date.now(),
        bio: "Test bio",
      };

      try {
        await axios.post(PERSONAS_URL, payload, authConfig(authToken));
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "failure in inserting new persona",
        );
      }
    });

    it("should return 400 when bio is missing", async () => {
      const payload = {
        username: "test_user_no_bio_" + Date.now(),
        persona: "Test persona description",
      };

      try {
        await axios.post(PERSONAS_URL, payload, authConfig(authToken));
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "failure in inserting new persona",
        );
      }
    });

    it("should be able to fetch newly created persona by username", async () => {
      const uniqueUsername = "username_fetch_test_" + Date.now();
      const payload = {
        username: uniqueUsername,
        persona: "Username fetch test persona",
        bio: "Username fetch test bio",
      };

      const createResponse = await axios.post(
        PERSONAS_URL,
        payload,
        authConfig(authToken),
      );
      expect(createResponse.status).toBe(201);

      const fetchResponse = await axios.get(
        `${PERSONAS_URL}/username/${uniqueUsername}`,
        authConfig(authToken),
      );
      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.data.username).toBe(uniqueUsername);
    });
  });

  describe("DELETE /personas/{id}", () => {
    it("should return 204 when deleting an existing persona", async () => {
      // First create a persona to delete
      const payload = {
        username: "delete_test_user_" + Date.now(),
        persona: "Delete test persona",
        bio: "Delete test bio",
      };

      const createResponse = await axios.post(
        PERSONAS_URL,
        payload,
        authConfig(authToken),
      );
      expect(createResponse.status).toBe(201);

      const getResponse = await axios.get(
        `${PERSONAS_URL}/username/${payload.username}`,
        authConfig(authToken),
      );
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.username).toBe(payload.username);

      const personaId = getResponse.data.persona_id;

      // Now delete it
      const deleteResponse = await axios.delete(
        `${PERSONAS_URL}/${personaId}`,
        authConfig(authToken),
      );
      expect(deleteResponse.status).toBe(204);
    });

    it("should return 404 when deleting non-existent persona", async () => {
      const nonExistentId = 99999;

      try {
        await axios.delete(
          `${PERSONAS_URL}/${nonExistentId}`,
          authConfig(authToken),
        );
        fail("Expected request to fail with 404");
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.detail).toContain(
          `Persona with id ${nonExistentId} not found`,
        );
      }
    });

    it("should not be able to fetch deleted persona", async () => {
      // Create a persona
      const payload = {
        username: "delete_verify_user_" + Date.now(),
        persona: "Delete verify persona",
        bio: "Delete verify bio",
      };

      const createResponse = await axios.post(
        PERSONAS_URL,
        payload,
        authConfig(authToken),
      );
      expect(createResponse.status).toBe(201);
      
      const getResponse = await axios.get(
        `${PERSONAS_URL}/username/${payload.username}`,
        authConfig(authToken),
      );
      
      expect(getResponse.status).toBe(200);

      const personaId = getResponse.data.persona_id;

      // Delete it
      const deleteResponse = await axios.delete(
        `${PERSONAS_URL}/${personaId}`,
        authConfig(authToken),
      );
      expect(deleteResponse.status).toBe(204);

      // Try to fetch - should get 404
      try {
        await axios.get(`${PERSONAS_URL}/${personaId}`, authConfig(authToken));
        fail("Expected request to fail with 404");
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it("should not be able to delete the same persona twice", async () => {
      // Create a persona
      const payload = {
        username: "double_delete_user_" + Date.now(),
        persona: "Double delete test persona",
        bio: "Double delete test bio",
      };

      const createResponse = await axios.post(
        PERSONAS_URL,
        payload,
        authConfig(authToken),
      );
      expect(createResponse.status).toBe(201);
      
      const getResponse = await axios.get(
        `${PERSONAS_URL}/username/${payload.username}`,
        authConfig(authToken),
      );
      
      expect(getResponse.status).toBe(200);
      
      const personaId = getResponse.data.persona_id;

      // First delete - should succeed
      const deleteResponse = await axios.delete(
        `${PERSONAS_URL}/${personaId}`,
        authConfig(authToken),
      );
      expect(deleteResponse.status).toBe(204);

      // Second delete - should fail with 404
      try {
        await axios.delete(
          `${PERSONAS_URL}/${personaId}`,
          authConfig(authToken),
        );
        fail("Expected second delete to fail with 404");
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe("Full CRUD Flow", () => {
    it("should support complete create-read-update-delete flow", async () => {
      const uniqueUsername = "crud_flow_user_" + Date.now();

      // CREATE
      const createPayload = {
        username: uniqueUsername,
        persona: "CRUD flow test persona",
        bio: "CRUD flow test bio",
      };

      const createResponse = await axios.post(
        PERSONAS_URL,
        createPayload,
        authConfig(authToken),
      );
      expect(createResponse.status).toBe(201);

      // READ by username
      const readByUsernameResponse = await axios.get(
        `${PERSONAS_URL}/username/${uniqueUsername}`,
        authConfig(authToken),
      );
      expect(readByUsernameResponse.status).toBe(200);
      
      // READ by ID
      const readByIdResponse = await axios.get(
        `${PERSONAS_URL}/${readByUsernameResponse.data.persona_id}`,
        authConfig(authToken),
      );
      const personaId = readByUsernameResponse.data.persona_id;
      expect(readByIdResponse.status).toBe(200);
      expect(readByIdResponse.data.username).toBe(uniqueUsername);
      expect(readByIdResponse.data.persona_id).toBe(personaId);

      // READ all (should contain new persona)
      const readAllResponse = await axios.get(
        PERSONAS_URL,
        authConfig(authToken),
      );
      expect(readAllResponse.status).toBe(200);
      const usernames = readAllResponse.data.map((p) => p.username);
      expect(usernames).toContain(uniqueUsername);

      // DELETE
      const deleteResponse = await axios.delete(
        `${PERSONAS_URL}/${personaId}`,
        authConfig(authToken),
      );
      expect(deleteResponse.status).toBe(204);

      // Verify DELETE
      try {
        await axios.get(`${PERSONAS_URL}/${personaId}`, authConfig(authToken));
        fail("Expected persona to be deleted");
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });
});
