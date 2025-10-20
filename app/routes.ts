import {
  type RouteConfig,
  route,
  index,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route(":id", "./routes/$id.tsx"),
  ...prefix("api", [
    route("delete-messages", "./routes/api/delete-messages.ts"),
  ]),
] satisfies RouteConfig;
