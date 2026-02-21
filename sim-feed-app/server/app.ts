import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import * as build from "virtual:react-router/server-build";
import { RouterContextProvider } from "react-router";

const app = new Hono();

const handler = createRequestHandler(build);

app.mount("/", (req) =>
  handler(req, new RouterContextProvider())
);

export default app.fetch;