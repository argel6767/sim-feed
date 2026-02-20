import { RouterContextProvider } from "react-router";

export function getLoadContext() {
  return new RouterContextProvider();
}