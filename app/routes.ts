import {
  index,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("./routes/index.tsx"),
  route(":uuid", "./routes/$uuid.tsx"),
  ...prefix("/api", [
    route("/delete-messages", "./routes/api/delete-messages.ts"),
  ]),
] satisfies RouteConfig;
