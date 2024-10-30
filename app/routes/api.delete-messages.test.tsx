import { loader } from "./api.delete-messages";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/.server/message");

describe("delete-messages loader", () => {
  function mockRequest(authHeader: string | null) {
    const url = new URL("https://localhost:3000");
    const headers = new Headers();
    const authorization = authHeader ? `${authHeader}` : "";
    headers.set("authorization", authorization);
    return new Request(url, { headers });
  }

  it("returns 401 if authorization header is missing in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.CRON_SECRET = "secret";
    const request = mockRequest(null);

    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("Unauthorized");
  });

  it("returns 401 if authorization header is incorrect in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.CRON_SECRET = "secret";
    const request = mockRequest("Bearer wrong-secret");

    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("Unauthorized");
  });

  it("returns 200 if authorization header is correct in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.CRON_SECRET = "secret";

    const request = mockRequest("Bearer secret");
    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(200);
    expect(await response.json()).toBe("Messages deleted successfully.");
  });
  // returns 200 in develeopment
  it("returns 200 in development", async () => {
    process.env.NODE_ENV = "development";
    const request = mockRequest(null);

    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(200);
    expect(await response.json()).toBe("Messages deleted successfully.");
  });
});
