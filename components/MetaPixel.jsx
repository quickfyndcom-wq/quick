"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const pathname = usePathname();

  if (!pixelId) return null;

  useEffect(() => {
    if (typeof window === "undefined") return;

    !(function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    if (!window.__metaPixelInitialized) {
      window.fbq && window.fbq("init", pixelId);
      window.__metaPixelInitialized = true;
    }
  }, [pixelId]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.fbq) return;

    const routeKey = `${pathname || ""}?${window.location.search || ""}`;
    if (window.__lastMetaPageView === routeKey) return;

    window.fbq("track", "PageView");
    window.__lastMetaPageView = routeKey;
  }, [pathname]);

    return (
      <>
        {/* Meta Pixel noscript fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            alt="Meta Pixel"
          />
        </noscript>
      </>
    );
}
