"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function UtmTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track UTM parameters from URL
    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');
    const utm_content = searchParams.get('utm_content');
    const utm_id = searchParams.get('utm_id');
    const utm_term = searchParams.get('utm_term');

    // Only proceed if at least one UTM parameter exists
    if (!utm_source && !utm_medium && !utm_campaign) return;

    const utmData = {
      source: utm_source || 'direct',
      medium: utm_medium || 'none',
      campaign: utm_campaign || 'none',
      content: utm_content || null,
      id: utm_id || null,
      term: utm_term || null,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || 'direct'
    };

    // Store in localStorage for entire session
    localStorage.setItem('utm_data', JSON.stringify(utmData));

    // Log for debugging
    console.log('📊 UTM Parameters Tracked:', utmData);

    // Send to Meta Pixel as custom event for better tracking
    if (window.fbq) {
      window.fbq('track', 'PageView', {
        utm_source: utm_source,
        utm_campaign: utm_campaign,
        utm_medium: utm_medium
      });
    }

    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        'utm_source': utm_source,
        'utm_medium': utm_medium,
        'utm_campaign': utm_campaign,
        'utm_content': utm_content,
        'utm_id': utm_id
      });
    }
  }, [searchParams]);

  return null;
}
