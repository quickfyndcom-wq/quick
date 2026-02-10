'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Large 404 Display */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-none mb-2">
            404
          </h1>
          <div className="relative">
            <p className="text-2xl md:text-4xl font-bold text-white mb-2">Oops! Page Not Found</p>
            <p className="text-slate-300 text-lg mb-8">The page you're looking for seems to have wandered off into the digital void.</p>
          </div>
        </div>

        {/* Animated Illustration */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-48 h-48">
            {/* Lost astronaut character */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-8xl animate-bounce">🧑‍🚀</div>
            </div>
            {/* Floating stars */}
            <div className="absolute top-4 left-8 text-2xl animate-pulse">✨</div>
            <div className="absolute top-12 right-4 text-2xl animate-pulse animation-delay-1000">⭐</div>
            <div className="absolute bottom-8 left-4 text-2xl animate-pulse animation-delay-2000">✨</div>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 p-8 mb-8">
          <p className="text-white text-lg mb-4">
            We explored every corner of the internet, but this page is lost in the cosmos.
          </p>
          <p className="text-slate-300">
            But don't worry! Let's get you back to exploring amazing products on QuickFynd.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg transition hover:shadow-xl hover:shadow-blue-500/50 transform hover:scale-105"
          >
            <span className="relative z-10">🏠 Back to Home</span>
          </Link>
          <Link
            href="/products"
            className="group relative px-8 py-3 bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 text-white font-bold rounded-lg transition hover:bg-opacity-20 transform hover:scale-105"
          >
            <span className="relative z-10">🛍️ Continue Shopping</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 p-6 bg-white bg-opacity-5 backdrop-blur rounded-xl border border-white border-opacity-10">
          <p className="text-slate-300 mb-4 text-sm">Quick Navigation:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Shop', href: '/shop' },
              { label: 'Categories', href: '/categories' },
              { label: 'Support', href: '/support' },
              { label: 'Help', href: '/help' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Status Code */}
        <p className="mt-12 text-slate-400 text-sm">Error Code: 404 | Page Not Found</p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
