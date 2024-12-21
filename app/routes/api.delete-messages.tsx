import { deleteExpiredOrOneTimeMessages } from "@/.server/message";
import type { Route } from "./api/+types/delete-messages";

export async function loader({ request }: Route.LoaderArgs) {
  const authorizationHeader = request.headers.get("authorization");
  // https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
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
    return new Response("Messages deleted successfully.", { status: 200 });
  } catch (error) {
    console.error("Error deleting messages:", error);
    return new Response(
      "An internal server error occurred while attempting to delete messages.",
      {
        status: 500,
      },
    );
  }
}
