import {
  index,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route(":uuid", "./routes/$uuid.tsx"),
  ...prefix("/api", [
    route("/delete-messages", "./routes/api.delete-messages.tsx"),
  ]),
] satisfies RouteConfig;
