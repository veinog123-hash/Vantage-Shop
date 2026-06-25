import "./globals.css";

export const metadata = {
  title: "Vantage",
  description: "FiveM Resources",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  );
}