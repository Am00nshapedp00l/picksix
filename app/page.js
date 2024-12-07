"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="relative flex flex-col items-center justify-center min-h-screen bg-slate-600">
        <img 
          src="https://wallpapers.com/images/hd/artwork-of-nfl-players-f4zn9oknjxpbjw11.jpg" 
          alt="Description of the image" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl text-gray-50 font-bold mb-4">Pick Six</h1>
          <p className="text-lg text-gray-50 mb-8">
            Explore fixtures, standings, and match highlights all in one place.
          </p>
          <div className="flex space-x-4">
            <Link href="/fixtures" legacyBehavior>
              <a className="btn-primary">Fixtures</a>
            </Link>
            <Link href="/standings" legacyBehavior>
              <a className="btn-primary">Standings</a>
            </Link>
            <Link href="/highlights" legacyBehavior>
              <a className="btn-primary">Highlights</a>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
