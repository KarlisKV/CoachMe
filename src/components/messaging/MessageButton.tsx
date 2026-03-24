'use client';

import Link from 'next/link';

interface Props {
  receiverId: string;
  receiverName: string;
}

export default function MessageButton({ receiverId, receiverName }: Props) {
  return (
    <Link
      href={`/messages/${receiverId}`}
      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Message
    </Link>
  );
}
