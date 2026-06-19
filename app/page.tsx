import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl text-center">
        <div className="mb-8">
          <Image
            src="/Splash.png"
            alt="You've Been Served - Bohn & Associates"
            width={900}
            height={500}
            className="mx-auto rounded-lg shadow-lg"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold mb-4">Bohn & Associates</h1>
        <p className="text-lg text-gray-600 mb-8">
          Process Serving Tracking System
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/mobile"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Mobile Portal (Field Users)
          </a>
          <a
            href="/admin"
            className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-black transition"
          >
            Admin Portal
          </a>
        </div>
      </div>
    </main>
  );
}