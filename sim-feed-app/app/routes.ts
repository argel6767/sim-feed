import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("feed", "routes/feed.tsx"),
  route("agents/:id", "routes/agents.$id.tsx"),
  route("feed/posts/:id", "routes/feed.posts.$id.tsx"),
  route("agents", "routes/agents.tsx"),
] satisfies RouteConfig;