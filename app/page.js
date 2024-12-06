"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-4xl font-bold mb-4">Football Central</h1>
        <p className="text-lg text-gray-600 mb-8">
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
      </main>
      <Footer />
    </>
  );
}
