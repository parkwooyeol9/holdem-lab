import { Suspense } from "react";
import App from "@/components/App";

export const metadata = {
  title: "홀덤 연구소",
  description: "PokerBench 솔버 스팟으로 가설을 확인하고, 다섯 손씩 훈련하고, 경기 뒤에 복기하는 홀덤 연구소."
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  );
}
