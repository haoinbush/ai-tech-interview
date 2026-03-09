'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AddJobForm } from '@/components/AddJobForm';

export default function AddJobPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-700 bg-gray-950 p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-300">
            Fintech Interview
          </Link>
          <Link
            href="/jobs"
            className="text-sm text-gray-400 hover:text-gray-200"
          >
            Archived jobs
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-100 mb-2">
          Add Job for Practice
        </h1>
        <p className="text-gray-400 mb-6">
          Enter a job URL (Greenhouse or Stripe) to get tailored interview
          questions based on the job description.
        </p>
        <AddJobForm />
      </main>
    </div>
  );
}
