import { createRequestHandler } from "react-router";
import { RouterContextProvider } from "react-router";

const requestHandler = createRequestHandler({
  // @ts-expect-error - virtual module
  build: () => import("virtual:react-router/server-build"),
  getLoadContext() {
    return new RouterContextProvider(new Map());
  },
});

export default requestHandler;