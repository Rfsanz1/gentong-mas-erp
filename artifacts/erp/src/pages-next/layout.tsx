import '../styles/globals.css';


export const metadata: Metadata = {
  title: 'Gentong Mas ERP',
  description: 'Enterprise Resource Planning — Gentong Mas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
