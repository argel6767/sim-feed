import { SCHEDULER_ENGINE_URL } from "./configs/urls.ts";
import axios from "axios";

const BOOTSTRAP_TOKEN = "token";
type AdminCredentials = {
  username: string;
  password: string;
  email: string;
  auth_token: string;
};

export const ADMIN_CREDS: AdminCredentials = {
  username: "coolestAdmin",
  password: "coolestAdminPassword",
  email: "coolestAdmin@example.com",
  auth_token: "",
};

beforeAll(async () => {
  const registerPayload = {
    username: ADMIN_CREDS.username,
    password: ADMIN_CREDS.password,
    email: ADMIN_CREDS.email,
    bootstrap_token: BOOTSTRAP_TOKEN,
  };

  // Try to register the admin
  try {
    const registerResponse = await axios.post(
      `${SCHEDULER_ENGINE_URL}/auths/register`,
      registerPayload,
    );

    if (registerResponse.status !== 201) {
      throw new Error(
        `Registration failed: ${registerResponse.status} - ${JSON.stringify(
          registerResponse.data,
        )}`,
      );
    }
  } catch (error) {
    // If admin already exists (409), we can continue
    if (error.response && error.response.status === 409) {
      console.log("Admin already exists, continuing with login...");
    } else {
      console.error("Registration failed:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  }

  // Try to login
  try {
    const loginResponse = await axios.post(
      `${SCHEDULER_ENGINE_URL}/auths/login`,
      {
        username: ADMIN_CREDS.username,
        password: ADMIN_CREDS.password,
      },
    );

    if (loginResponse.status !== 200) {
      throw new Error(
        `Login failed: ${loginResponse.status} - ${JSON.stringify(
          loginResponse.data,
        )}`,
      );
    }

    ADMIN_CREDS.auth_token = loginResponse.data.access_token;
  } catch (error) {
    console.error("Login failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
});
