import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { dark } from '@clerk/themes'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import type { Route } from "./+types/root";
import "./app.css";
import { ToastProvider } from "./components/toast";
import { NotificationHolder, GoogleAnalyticsHolder } from "./components/holders";
import { LoadingBar } from "./components/loading";

import { clerkMiddleware, rootAuthLoader } from '@clerk/react-router/server'
import { ClerkProvider } from '@clerk/react-router'

export const middleware = [clerkMiddleware()]

export const loader = (args: Route.LoaderArgs) => rootAuthLoader(args)

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const queryClient = new QueryClient();

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider loaderData={loaderData} appearance={{
      theme: dark,
      variables: { colorPrimaryForeground: '#d4d4d4', colorShimmer: '#e8b88a', colorPrimary: '#e8b88a', colorMutedForeground: '#a0a0a0' },
      elements: {
        formButtonPrimary: {
          color: "#1a1a1a"
        },
        avatarBox: {
          color: '#e8b88a'
        }
      }
    }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <LoadingBar/>
          <NotificationHolder />
          <GoogleAnalyticsHolder />
          <Outlet />
        </ToastProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
