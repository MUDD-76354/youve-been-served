import HomeContent from "@/components/HomeContent";
import LoadingSpinner from "@/components/mobile/LoadingSpinner";
import { Suspense } from "react";

function HomeLoading() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 py-20">
      <LoadingSpinner className="h-8 w-8 text-blue-600" label="Loading" />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}