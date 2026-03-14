import axios from "axios";
import { USER_SERVICE_URL } from "../../configs/urls.ts";

describe("User Service Base Endpoints", () => {
  describe("GET /", () => {
    it("should return 200 and a welcome message", async () => {
      const response = await axios.get(`${USER_SERVICE_URL}/`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("message");
      expect(response.data).toHaveProperty("status");
      expect(response.data.status).toBe("OK");
    });

    it("should return a JSON content type", async () => {
      const response = await axios.get(`${USER_SERVICE_URL}/`);

      expect(response.headers["content-type"]).toContain("application/json");
    });
  });
});
