import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { dark } from '@clerk/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpeedInsights } from "@vercel/speed-insights/react"

import type { Route } from "./+types/root";
import "./app.css";
import { GoogleAnalyticsHolder } from "./components/holders";
import { LoadingBar } from "./components/loading";

import { clerkMiddleware, rootAuthLoader } from '@clerk/react-router/server'
import { ClerkProvider } from '@clerk/react-router'
import { GoUp } from "./components/go-up";
import { UserLikesPostIdsWrapper } from "./components/user-likes-post-ids";
import { AuthTokenProvider } from "./contexts/auth-token-context";
import { useState } from "react";
import { Footer } from "./components/footer";
import { Link } from "react-router";


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
        <SpeedInsights/>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimaryForeground: '#d4d4d4',
    colorShimmer: '#e8b88a',
    colorPrimary: '#e8b88a',
    colorMutedForeground: '#a0a0a0'
  },
  elements: {
    formButtonPrimary: {
      color: "#1a1a1a"
    },
    avatarBox: {
      color: '#e8b88a'
    }
  }
};

export default function App({ loaderData }: Route.ComponentProps) {
  const [queryClient] = useState(new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10,
      },
    },
  }));
  return (
    <ClerkProvider loaderData={loaderData} appearance={clerkAppearance}>
      <AuthTokenProvider>
        <QueryClientProvider client={queryClient}>
          <UserLikesPostIdsWrapper >
            <LoadingBar />
            <GoUp/>
              <GoogleAnalyticsHolder />
              <Outlet />
          </UserLikesPostIdsWrapper>
        </QueryClientProvider>
      </AuthTokenProvider>
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let details = "An unexpected error occurred. Please try again later.";
  let stack: string | undefined;
  let is404 = false;

  if (isRouteErrorResponse(error)) {
    is404 = error.status === 404;
    details = is404
      ? "The page you're looking for doesn't exist or has been moved."
      : error.statusText || details;
  } else if (error instanceof Error) {
    details = import.meta.env.DEV ? error.message : details;
    stack = import.meta.env.DEV ? error.stack : undefined;
  }

  return (
    <div className="bg-sf-bg-primary text-sf-text-primary min-h-screen flex flex-col">
      {/* Header — mirrors your landing page */}
      <header className="px-8 py-6 border-b border-sf-border-primary bg-sf-bg-secondary">
        <div className="text-[1.3rem] font-bold tracking-[2px]">SIM-FEED</div>
      </header>

      {/* Error content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-sf-accent-primary text-[0.85rem] font-semibold tracking-[2px] uppercase mb-4">
          {is404 ? "404 — Not Found" : "500 — Server Error"}
        </p>
        <h1 className="text-5xl md:text-[3.2rem] font-semibold tracking-[0.5px] mb-6">
          {is404 ? "Lost in the feed." : "Something broke."}
        </h1>
        <p className="text-sf-text-secondary text-[1.1rem] max-w-md mx-auto mb-12 leading-relaxed">
          {details}
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-9 py-4 text-[0.85rem] font-semibold tracking-[0.5px] uppercase rounded border border-sf-accent-primary bg-sf-accent-primary text-sf-bg-primary transition-all duration-300 hover:bg-sf-accent-hover hover:border-sf-accent-hover hover:shadow-[0_4px_12px_rgba(232,184,138,0.2)]"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-9 py-4 text-[0.85rem] font-semibold tracking-[0.5px] uppercase rounded border border-sf-border-subtle bg-transparent text-sf-text-tertiary transition-all duration-300 hover:border-sf-text-secondary hover:text-sf-text-primary hover:bg-[rgba(212,212,212,0.05)]"
          >
            Go Back
          </button>
        </div>

        {stack && (
          <pre className="mt-12 w-full max-w-2xl p-6 rounded-lg bg-sf-bg-card border border-sf-border-primary overflow-x-auto text-left text-sm text-sf-text-muted">
            <code>{stack}</code>
          </pre>
        )}
      </main>

      <Footer />
    </div>
  );
}