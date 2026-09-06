import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Conoid";
const baseHref = import.meta.env.BASE_URL || "/";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${APP_NAME} — Jackson Cross Cylinder` },
      {
        name: "description",
        content:
          "See residual astigmatism as a sine wave and watch Sturm’s conoid move as you flip a Jackson cross cylinder.",
      },
      { name: "theme-color", content: "#0b0d10" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: `${baseHref}favicon.svg` },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: `${baseHref}__grok/manifest.webmanifest` },
      { rel: "apple-touch-icon", href: `${baseHref}__grok/icon-180.png` },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap",
      },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <div className="bg-bg text-fg antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </div>
      <Scripts />
    </>
  ),
});
