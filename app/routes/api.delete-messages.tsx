import { deleteExpiredOrOneTimeMessages } from "@/.server/message";
import type { LoaderFunctionArgs } from "@vercel/remix";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorizationHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV !== "development" &&
    authorizationHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  try {
    await deleteExpiredOrOneTimeMessages();
    return json("Messages deleted successfully.");
  } catch (error) {
    console.error("Error deleting messages:", error);
    return json("An error occurred while attempting to delete messages.", {
      status: 500,
    });
  }
}
