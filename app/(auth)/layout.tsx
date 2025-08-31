import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Authentification - DSR",
  description: "Connectez-vous au système DSR",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex">
      {/* Left Panel - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/signin-image.svg"
          alt="DSR Authentication Illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Panel - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="max-w-md w-full">{children}</div>
      </div>
    </div>
  );
}
