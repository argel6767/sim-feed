import axios from "axios";
import { SCHEDULER_ENGINE_URL } from "../../configs/urls.ts";
import { ADMIN_CREDS } from "../../setupTests.ts";

const AUTHS_URL = `${SCHEDULER_ENGINE_URL}/auths`;

// Bootstrap token from compose.yaml
const BOOTSTRAP_TOKEN = "token";

describe("Auth Endpoints", () => {
  describe("POST /auths/register - First Admin Registration", () => {
    it("should return 400 when username is missing", async () => {
      const payload = {
        email: "test@newadmin.com",
        password: "SecurePass123!",
        bootstrap_token: BOOTSTRAP_TOKEN,
      };

      try {
        await axios.post(`${AUTHS_URL}/register`, payload);
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "Username or password is missing",
        );
      }
    });

    it("should return 400 when email is missing", async () => {
      const payload = {
        username: "new_test_admin",
        password: "SecurePass123!",
        bootstrap_token: BOOTSTRAP_TOKEN,
      };

      try {
        await axios.post(`${AUTHS_URL}/register`, payload);
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "Username or password is missing",
        );
      }
    });

    it("should return 400 when password is missing", async () => {
      const payload = {
        username: "new_test_admin",
        email: "test@newadmin.com",
        bootstrap_token: BOOTSTRAP_TOKEN,
      };

      try {
        await axios.post(`${AUTHS_URL}/register`, payload);
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "Username or password is missing",
        );
      }
    });

    it("should return 409 when username already exists", async () => {
      const payload = {
        username: ADMIN_CREDS.username,
        email: "different@email.com",
        password: "SecurePass123!",
        invite_token: "abc123def456ghi789jkl012mno345pqr",
      };

      try {
        await axios.post(`${AUTHS_URL}/register`, payload);
        fail("Expected request to fail with 409");
      } catch (error) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.detail).toContain("Admin already exists");
      }
    });
  });

  describe("POST /auths/register - Subsequent Admin Registration", () => {
    it("should return 400 when invite token is missing for subsequent admin", async () => {
      const payload = {
        username: "new_test_admin",
        email: "newadmin@simfeed.test",
        password: "SecurePass123!",
      };

      try {
        await axios.post(`${AUTHS_URL}/register`, payload);
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain("Invite token is missing");
      }
    });

    it("should return 404 when admin invitation not found for email", async () => {
      const payload = {
        username: "brand_new_admin",
        email: "nonexistent@invitation.com",
        password: "SecurePass123!",
        invite_token: "some_random_token",
      };

      try {
        await axios.post(`${AUTHS_URL}/register`, payload);
        fail("Expected request to fail with 404");
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.detail).toContain(
          "Admin invitation not found",
        );
      }
    });

    it("should return 403 when invite token does not match", async () => {
      const payload = {
        username: "newadmin_test",
        email: "newadmin@simfeed.test",
        password: "SecurePass123!",
        invite_token: "wrong_token_value",
      };

      try {
        await axios.post(`${AUTHS_URL}/register`, payload);
        fail("Expected request to fail with 403");
      } catch (error) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.detail).toContain(
          "Invalid invite token given",
        );
      }
    });

    it("should return 201 and register new admin with valid invite token", async () => {
      const payload = {
        username: "newadmin_with_invite",
        email: "newadmin@simfeed.test",
        password: "SecurePass123!",
        invite_token: "abc123def456ghi789jkl012mno345pqr",
      };

      const response = await axios.post(`${AUTHS_URL}/register`, payload);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("message");
      expect(response.data.message).toContain("Admin registered successfully");
      expect(response.data).toHaveProperty("admin_info");
    });
  });

  describe("POST /auths/login", () => {
    it("should return 200 and access token for valid credentials", async () => {
      const payload = {
        username: ADMIN_CREDS.username,
        password: ADMIN_CREDS.password,
      };

      const response = await axios.post(`${AUTHS_URL}/login`, payload);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("access_token");
      expect(response.data).toHaveProperty("token_type");
      expect(response.data.token_type).toBe("bearer");
      expect(typeof response.data.access_token).toBe("string");
      expect(response.data.access_token.length).toBeGreaterThan(0);
    });

    it("should return 400 when username is missing", async () => {
      const payload = {
        password: "password",
      };

      try {
        await axios.post(`${AUTHS_URL}/login`, payload);
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "Username or password is missing",
        );
      }
    });

    it("should return 400 when password is missing", async () => {
      const payload = {
        username: ADMIN_CREDS.username,
      };

      try {
        await axios.post(`${AUTHS_URL}/login`, payload);
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "Username or password is missing",
        );
      }
    });

    it("should return 400 when both username and password are empty strings", async () => {
      const payload = {
        username: "",
        password: "",
      };

      try {
        await axios.post(`${AUTHS_URL}/login`, payload);
        fail("Expected request to fail with 400");
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.detail).toContain(
          "Username or password is missing",
        );
      }
    });

    it("should return 404 when user does not exist", async () => {
      const payload = {
        username: "nonexistent_admin_user",
        password: "somepassword123",
      };

      try {
        await axios.post(`${AUTHS_URL}/login`, payload);
        fail("Expected request to fail with 404");
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.detail).toContain("Admin not found");
      }
    });

    it("should return 401 when password is incorrect", async () => {
      const payload = {
        username: ADMIN_CREDS.username,
        password: "wrongpassword",
      };

      try {
        await axios.post(`${AUTHS_URL}/login`, payload);
        fail("Expected request to fail with 401");
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.detail).toContain("Incorrect password");
      }
    });

    it("should return valid JWT token structure", async () => {
      const payload = {
        username: ADMIN_CREDS.username,
        password: ADMIN_CREDS.password,
      };

      const response = await axios.post(`${AUTHS_URL}/login`, payload);

      expect(response.status).toBe(200);

      const token = response.data.access_token;
      // JWT tokens have 3 parts separated by dots
      const tokenParts = token.split(".");
      expect(tokenParts.length).toBe(3);
    });

    it("should allow newly registered admin with invite token to login", async () => {
      const loginPayload = {
        username: "newadmin_with_invite",
        password: "SecurePass123!",
      };

      const loginResponse = await axios.post(
        `${AUTHS_URL}/login`,
        loginPayload,
      );

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty("access_token");
      expect(loginResponse.data.token_type).toBe("bearer");
    });

    it("should allow newly registered admin with pending invite to login", async () => {
      // First register with pending invitation
      const registerPayload = {
        username: "pending_admin_test",
        email: "pending@simfeed.test",
        password: "TestPassword456!",
        invite_token: "xyz987wvu654tsr321pon098mlk765jih",
      };

      const registerResponse = await axios.post(
        `${AUTHS_URL}/register`,
        registerPayload,
      );
      expect(registerResponse.status).toBe(201);

      // Now try to login with the new admin
      const loginPayload = {
        username: "pending_admin_test",
        password: "TestPassword456!",
      };

      const loginResponse = await axios.post(
        `${AUTHS_URL}/login`,
        loginPayload,
      );

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty("access_token");
      expect(loginResponse.data.token_type).toBe("bearer");
    });
  });
});
