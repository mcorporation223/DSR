import { SignInForm } from "./components/signin-form";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Système de gestion DSR
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
