import * as build from "virtual:react-router/server-build";
import { createRequestHandler, RouterContextProvider } from "react-router";

export default async function handler(request: Request) {
  return createRequestHandler(build)(request, new RouterContextProvider());
}