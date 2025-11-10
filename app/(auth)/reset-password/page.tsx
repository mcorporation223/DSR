"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";

// Form validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<{
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");

  // Validate token on page load
  const validateTokenQuery = trpc.users.validateResetToken.useQuery(
    { token: token || "" },
    {
      enabled: !!token,
      retry: false,
    }
  );

  // Update state based on query result
  useEffect(() => {
    if (validateTokenQuery.data) {
      setIsTokenValid(validateTokenQuery.data.valid);
      if (validateTokenQuery.data.valid && "user" in validateTokenQuery.data) {
        setUserInfo(validateTokenQuery.data.user);
      }
    } else if (validateTokenQuery.error) {
      setIsTokenValid(false);
    }
  }, [validateTokenQuery.data, validateTokenQuery.error]);

  // Reset password mutation
  const resetPasswordMutation = trpc.users.resetPassword.useMutation({
    onSuccess: (data) => {
      toastNotification.success("Succès", data.message);
      // Redirect to signin page after successful reset
      setTimeout(() => {
        router.push("/signin?message=password-reset-success");
      }, 2000);
    },
    onError: (error) => {
      toastNotification.error("Erreur", error.message);
    },
  });

  // Handle form submission
  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toastNotification.error("Erreur", "Token manquant");
      return;
    }

    resetPasswordMutation.mutate({
      token,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
  };

  // Password strength indicators
  const getPasswordStrength = (password: string) => {
    const checks = [
      { label: "Au moins 8 caractères", test: password.length >= 8 },
      { label: "Au moins une majuscule", test: /[A-Z]/.test(password) },
      { label: "Au moins une minuscule", test: /[a-z]/.test(password) },
      { label: "Au moins un chiffre", test: /\d/.test(password) },
    ];
    return checks;
  };

  const passwordChecks = password ? getPasswordStrength(password) : [];

  // Show loading state while validating token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Lien invalide
              </h1>
              <p className="text-gray-600 mb-4">
                Le lien de réinitialisation est manquant ou invalide.
              </p>
              <Button onClick={() => router.push("/signin")} className="w-full">
                Retourner à la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (validateTokenQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Spinner className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Vérification du lien...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Lien expiré
              </h1>
              <p className="text-gray-600 mb-4">
                Ce lien de réinitialisation a expiré ou a déjà été utilisé.
                Veuillez demander un nouveau lien.
              </p>
              <Button onClick={() => router.push("/signin")} className="w-full">
                Retourner à la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Nouveau mot de passe
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {userInfo
              ? `Bonjour ${userInfo.firstName || ""} ${
                  userInfo.lastName || ""
                }, définissez votre nouveau mot de passe`
              : "Définissez votre nouveau mot de passe"}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre nouveau mot de passe"
                  className={errors.password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password Strength Indicators */}
            {password && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Exigences du mot de passe :
                </Label>
                <div className="space-y-1">
                  {passwordChecks.map((check, index) => (
                    <div key={index} className="flex items-center text-sm">
                      {check.test ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span
                        className={
                          check.test ? "text-green-700" : "text-red-600"
                        }
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || resetPasswordMutation.isPending}
            >
              {isSubmitting || resetPasswordMutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour le mot de passe"
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Sécurité :</strong> Après la mise à jour, vous serez
              redirigé vers la page de connexion pour vous connecter avec votre
              nouveau mot de passe.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
