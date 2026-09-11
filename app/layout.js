import "./globals.css";
import "./lounge.css";
import "./live.css";
import "./practice.css";

export const metadata = {
  title: "Holdem Lab — Learn GTO by Playing",
  description: "Interactive poker training on PokerBench solver spots: GTOWizard preflop and WASM-Postflop postflop."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
