import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold text-blue-600">CoachMe</Link>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/coaches" className="hover:text-gray-700">Browse Coaches</Link>
            <Link href="/signup" className="hover:text-gray-700">Become a Coach</Link>
          </div>
          <p className="text-sm text-gray-400">&copy; 2026 CoachMe</p>
        </div>
      </div>
    </footer>
  );
}
