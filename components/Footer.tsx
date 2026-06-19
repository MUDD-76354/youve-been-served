import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white py-4 mt-auto">
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <Image
            src="/Logo.jpg"
            alt="Bohn & Associates Logo"
            width={80}
            height={40}
            className="object-contain"
          />
        </div>
        <p className="text-xs text-gray-600 tracking-wide">
          TX Lic: A19549
        </p>
      </div>
    </footer>
  );
}