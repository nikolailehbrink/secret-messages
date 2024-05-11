export function messageNotFoundResponse() {
  return new Response(
    `The message you are looking for does not exist. Please check the URL and try again.`,
    {
      status: 404,
      statusText: "Message not found!",
    },
  );
}
