import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Spinner className="w-8 h-8 text-blue-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
