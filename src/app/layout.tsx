import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fintech Interview Platform',
  description: 'Practice SQL and Python for fintech technical interviews',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-900 text-gray-100">
        {children}
      </body>
    </html>
  );
}
