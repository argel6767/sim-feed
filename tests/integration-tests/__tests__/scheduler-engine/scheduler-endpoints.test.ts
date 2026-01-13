import axios from 'axios';
import { SCHEDULER_ENGINE_URL } from '../../configs/urls.ts';
import { ADMIN_CREDS } from '../../setupTests.ts';

const SCHEDULER_URL = `${SCHEDULER_ENGINE_URL}/scheduler`;

function authConfig(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

describe("Scheduler Endpoints", () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token before running tests
    authToken = await ADMIN_CREDS.auth_token;
  });

  describe("Authentication Required", () => {
    it("should return 401/403 for PUT /scheduler/interval without auth token", async () => {
      const payload = {
        interval: 10,
      };

      try {
        await axios.put(`${SCHEDULER_URL}/interval`, payload);
        fail("Expected request to fail without auth");
      } catch (error) {
        // FastAPI OAuth2 returns 401 for missing token
        expect([401, 403]).toContain(error.response.status);
      }
    });

    it("should return 403 for PUT /scheduler/interval with invalid auth token", async () => {
      const payload = {
        interval: 10,
      };

      const invalidConfig = {
        headers: {
          Authorization: "Bearer invalid_token_value",
        },
      };

      try {
        await axios.put(`${SCHEDULER_URL}/interval`, payload, invalidConfig);
        fail("Expected request to fail with invalid auth");
      } catch (error) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.detail).toContain("Invalid credentials");
      }
    });
  });

  describe("PUT /scheduler/interval", () => {
    it("should return 204 when updating interval with valid data", async () => {
      const payload = {
        interval: 15,
      };

      const response = await axios.put(
        `${SCHEDULER_URL}/interval`,
        payload,
        authConfig(authToken),
      );

      expect(response.status).toBe(204);
    });

    it("should return 400 when interval is missing from request body", async () => {
      const payload = {};

      try {
        await axios.put(
          `${SCHEDULER_URL}/interval`,
          payload,
          authConfig(authToken),
        );
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain("Missing interval");
      }
    });

    it("should accept different interval values", async () => {
      const intervals = [5, 10, 30, 60];

      for (const interval of intervals) {
        const payload = { interval };
        const response = await axios.put(
          `${SCHEDULER_URL}/interval`,
          payload,
          authConfig(authToken),
        );
        expect(response.status).toBe(204);
      }
    });

    it("should accept interval as string number", async () => {
      const payload = {
        interval: "20",
      };

      const response = await axios.put(
        `${SCHEDULER_URL}/interval`,
        payload,
        authConfig(authToken),
      );

      expect(response.status).toBe(204);
    });

    it("should return 400 when interval is null", async () => {
      const payload = {
        interval: null,
      };

      try {
        await axios.put(
          `${SCHEDULER_URL}/interval`,
          payload,
          authConfig(authToken),
        );
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain("Missing interval");
      }
    });

    it("should return 400 when interval is empty string", async () => {
      const payload = {
        interval: "",
      };

      try {
        await axios.put(
          `${SCHEDULER_URL}/interval`,
          payload,
          authConfig(authToken),
        );
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain("Missing interval");
      }
    });

    it("should handle request with additional fields in payload", async () => {
      const payload = {
        interval: 25,
        extraField: "should be ignored",
        anotherField: 123,
      };

      const response = await axios.put(
        `${SCHEDULER_URL}/interval`,
        payload,
        authConfig(authToken),
      );

      expect(response.status).toBe(204);
    });
  });
});
