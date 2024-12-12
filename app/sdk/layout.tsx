import '@/sdk/styles/embedded.css';

export const metadata = {
  title: 'Bots4Ed Chat',
  description: 'Educational Counseling Chat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-transparent">{children}</body>
    </html>
  );
}