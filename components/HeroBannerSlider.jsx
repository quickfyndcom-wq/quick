'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BannerC from '@/assets/heroslider1/main2.webp';
import WideBanner1 from '@/assets/heroslider1/main3.webp';
import WideBanner2 from '@/assets/heroslider1/main1.webp';
import Banner3 from '@/assets/heroslider1/banner05.avif';

const HEIGHT = 320;

const slides = [
  { image: BannerC, link: '/offers', bg: '#420608' },
  { image: WideBanner1, link: '/offers', bg: '#0071A4' },
  { image: Banner3, link: '/offers', bg: '#8a1114' },
  { image: WideBanner2, link: '/offers', bg: '#00D5C3' },
];

export default function HeroBannerSlider() {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(() => slides.map(() => false));
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Mark initial load as complete once first image loads
    if (loaded[0]) {
      setIsInitialLoad(false);
    }
  }, [loaded]);

  useEffect(() => {
    // Fallback: if images haven't loaded after 800ms, show banner anyway
    const timeout = setTimeout(() => {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }, 800);
    
    return () => clearTimeout(timeout);
  }, [isInitialLoad]);

  // Show skeleton while first image is loading
  if (isInitialLoad && !loaded[0]) {
    return (
      <div className="hero-banner-skeleton" style={{
        width: '100%',
        height: `${HEIGHT}px`,
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1250px',
          height: '100%',
          background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}></div>
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          
          @media (max-width: 640px) {
            .hero-banner-skeleton {
              height: auto;
              aspect-ratio: 1250 / 320;
              min-height: calc(100vw * 320 / 1250);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    /* FULL WIDTH BACKGROUND */
    <div
      className="hero-banner"
      style={{
        backgroundColor: slides[index].bg,
      }}
    >
      {/* IMAGE VIEWPORT (CENTERED, FIXED WIDTH) */}
      <div className="hero-banner__viewport">
        {slides.map((slide, i) => (
          <div
            key={i}
            onClick={() => router.push(slide.link)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              opacity: i === index ? 1 : 0,
              clipPath: i === index ? 'circle(120% at 50% 50%)' : 'circle(0% at 50% 50%)',
              transition: 'opacity 0.6s ease',
              animation: i === index ? 'qfCircleReveal 0.9s ease' : 'none',
              pointerEvents: i === index ? 'auto' : 'none',
            }}
          >
            <Image
              src={slide.image}
              alt="Banner"
              width={1250}
              height={HEIGHT}
              priority={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
              quality={i === 0 ? 85 : 75}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
              onLoadingComplete={() => {
                setLoaded((prev) => {
                  if (prev[i]) return prev;
                  const next = [...prev];
                  next[i] = true;
                  return next;
                });
              }}
              onError={() => {
                // Silently handle image load failures and continue
                setLoaded((prev) => {
                  if (prev[i]) return prev;
                  const next = [...prev];
                  next[i] = true; // Mark as loaded to prevent blocking
                  return next;
                });
                // Show banner anyway if image fails
                setIsInitialLoad(false);
              }}
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .hero-banner {
          width: 100%;
          height: ${HEIGHT}px;
          position: relative;
          overflow: hidden;
          transition: background-color 0.6s ease;
          display: flex;
          justify-content: center;
        }

        .hero-banner__viewport {
          position: relative;
          height: 100%;
          width: 100%;
          max-width: 1250px;
          overflow: hidden;
        }

        @media (max-width: 640px) {
          .hero-banner {
            height: auto;
            aspect-ratio: 1250 / 320;
            min-height: calc(100vw * 320 / 1250);
          }

          .hero-banner__viewport {
            height: 100%;
          }
        }

        @keyframes qfCircleReveal {
          0% { clip-path: circle(0% at 50% 50%); filter: blur(3px); }
          70% { clip-path: circle(70% at 50% 50%); filter: blur(0px); }
          100% { clip-path: circle(120% at 50% 50%); filter: blur(0px); }
        }
      `}</style>

      {/* PILLS */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          padding: '3px 5px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === index ? 40 : 30,
              height: 6,
              borderRadius: 999,
              background: i === index ? 'rgba(255, 255, 255, 0.56)' : 'rgba(0,0,0,0.2)',
              boxShadow: i === index ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
              cursor: 'pointer',
              border: 'none',
              padding: 0,
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
