"use client";
import { useEffect } from "react";

export default function FbqInitiateCheckout() {
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }
  }, []);
  return null;
}
