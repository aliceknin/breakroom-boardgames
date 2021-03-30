export const SERVER_ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "https://breakroom-boardgames.herokuapp.com"
    : "http://localhost:4005";
