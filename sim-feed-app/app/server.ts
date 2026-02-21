import { type AppLoadContext, RouterContextProvider } from "react-router";

export function getLoadContext(
  request: Request
): RouterContextProvider {
  return new RouterContextProvider(new Map<any, any>());
}