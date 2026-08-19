import "./globals.css";
import "./lounge.css";
import "./live.css";

export const metadata = {
  title: "Holdem Lab — Learn GTO by Playing",
  description: "Interactive poker training with clear ranges, strategy mixes and instant coaching."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
