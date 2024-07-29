import { deleteExpiredOrOneTimeMessages } from "@/.server/message";
import { json } from "@vercel/remix";

export async function loader() {
  try {
    await deleteExpiredOrOneTimeMessages();
    return json("Messages deleted successfully.");
  } catch (error) {
    console.log(error);
    return json("An error occurred while attempting to delete messages.", {
      status: 500,
    });
  }
}
