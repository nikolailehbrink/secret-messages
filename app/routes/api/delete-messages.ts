import { deleteExpiredOrOneTimeMessages } from "@/.server/message";
import type { Route } from "./+types/delete-messages";

export async function loader({ request }: Route.LoaderArgs) {
  const authorizationHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  // https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
  // Checking for the secret itself matters: without it the comparison would
  // run against the string "Bearer undefined", which anyone could send.
  if (
    process.env.NODE_ENV !== "development" &&
    (!cronSecret || authorizationHeader !== `Bearer ${cronSecret}`)
  ) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  try {
    await deleteExpiredOrOneTimeMessages();
    return new Response("Messages deleted successfully.", {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting messages:", error);
    return new Response(
      "An error occurred while attempting to delete messages.",
      {
        status: 500,
      },
    );
  }
}
