"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, AlertCircle, LogIn } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toastNotification } from "@/components/toast-notification";

const signInSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe invalide");
        toastNotification.error(
          "Échec de Connexion",
          "Email ou mot de passe invalide"
        );
      } else if (result?.ok) {
        toastNotification.success(
          "Succès!",
          "Connexion réussie! Redirection..."
        );
        // Redirect to dashboard on successful login
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Une erreur s'est produite lors de la connexion");
      toastNotification.error(
        "Erreur de Connexion",
        "Une erreur s'est produite lors de la connexion"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full" suppressHydrationWarning={true}>
      <div className="space-y-6" suppressHydrationWarning={true}>
        {/* Header */}
        <div className="text-center" suppressHydrationWarning={true}>
          {/* <div
            className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
            suppressHydrationWarning={true}
          >
            <Shield className="h-8 w-8 text-blue-600" />
          </div> */}
          <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="mt-2 text-gray-600">
            Connectez-vous à votre compte DSR
          </p>
        </div>

        <Card className="shadow-xl border-0" suppressHydrationWarning={true}>
          <CardHeader className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <LogIn className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Système de Gestion DSR
                </p>
                <p className="text-xs text-blue-600">
                  Accédez à votre espace de travail sécurisé
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="email" className="text-sm font-medium">
                    Adresse Email
                  </Label>
                </div>

                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Entrez votre adresse email"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    {...form.register("email")}
                  />
                </div>

                {form.formState.errors.email && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {form.formState.errors.email.message}
                    </span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mot de Passe
                  </Label>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Entrez votre mot de passe"
                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    {...form.register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>

                {form.formState.errors.password && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {form.formState.errors.password.message}
                    </span>
                  </div>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                  onClick={() =>
                    toastNotification.success(
                      "Information",
                      "Fonctionnalité bientôt disponible"
                    )
                  }
                >
                  Mot de passe oublié ?
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Problème de connexion ? Contactez votre administrateur système
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
