import "./styles/site.css";
import "./styles/guide.css";
import "./styles/lab.css";
import Providers from "@/components/Providers";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

const SITE = "VietnamPokerTrip";
const DESCRIPTION =
  "하노이 포커 여행 한 권. QPC Winter 2026 일정과 바이인, 포커 전략 노트, 솔버 데이터로 훈련하고 복기하는 홀덤 연구소, 베트남 문화 가이드.";

export const metadata = {
  metadataBase: new URL("https://eatplaypoker.vercel.app"),
  title: { default: `${SITE} · 하노이 포커 여행`, template: `%s · ${SITE}` },
  description: DESCRIPTION,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: `${SITE} · 하노이 포커 여행`,
    description: DESCRIPTION,
    url: "https://eatplaypoker.vercel.app",
    siteName: SITE,
    locale: "ko_KR",
    type: "website"
  }
};

export const viewport = { themeColor: "#142520" };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <a className="skip" href="#main">
          본문 바로가기
        </a>
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
