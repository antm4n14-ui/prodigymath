export const metadata = {
  title: 'Browser Console',
  description: 'Web browser with custom F12 console',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
