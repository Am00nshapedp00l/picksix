import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
    <div className="container mx-auto flex justify-between">
      <Link legacyBehavior href="/">
      <a className="text-white text-xl font-bold">Pick Six</a>
      </Link>
      <div className="space-x-4">
      <Link legacyBehavior href="/fixtures">
        <a className="text-gray-300">Fixtures</a>
      </Link>
      <Link legacyBehavior href="/standings">
        <a className="text-gray-300">Standings</a>
      </Link>
      <Link legacyBehavior href="/highlights">
        <a className="text-gray-300">Highlights</a>
      </Link>
      </div>
    </div>
    </nav>
  );
}
  