import { loader } from "@/routes/api/delete-messages";
import { describe, it, expect } from "vitest";

describe("delete-messages loader", () => {
  function mockRequest(authorizationHeader: string | null) {
    const authorization = (authorizationHeader ??= "");
    return new Request("https://localhost:3000", {
      headers: {
        Authorization: authorization,
      },
    });
  }
  function generateLoaderFunctionArgs(request: Request) {
    return { request, params: {}, context: {} };
  }

  it("returns 401 if authorization header is missing in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.CRON_SECRET = "secret";
    const request = mockRequest(null);
    const response = await loader(generateLoaderFunctionArgs(request));
    expect(response.status).toBe(401);
    expect(await response.text()).toBe("Unauthorized");
  });

  it("returns 401 if authorization header is incorrect in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.CRON_SECRET = "secret";

    const request = mockRequest("Bearer wrong-secret");
    const response = await loader(generateLoaderFunctionArgs(request));

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("Unauthorized");
  });

  it("returns 200 if authorization header is correct in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.CRON_SECRET = "secret";

    const request = mockRequest("Bearer secret");
    const response = await loader(generateLoaderFunctionArgs(request));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Messages deleted successfully.");
  });
  // returns 200 in development
  it("returns 200 in development", async () => {
    process.env.NODE_ENV = "development";

    const request = mockRequest(null);
    const response = await loader(generateLoaderFunctionArgs(request));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Messages deleted successfully.");
  });
});
