"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Key,
  UserCheck,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toastNotification } from "@/components/toast-notification";
import { trpc } from "@/components/trpc-provider";
import { signIn } from "next-auth/react";

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

interface PasswordRequirement {
  met: boolean;
  text: string;
}

export default function SetupPasswordPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="w-full">
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Chargement...</h1>
          </div>
          <Card className="shadow-xl border-0">
            <CardContent className="space-y-6 py-8">
              <div className="text-center">
                <Spinner className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="mt-2 text-sm text-gray-600">Initialisation...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <SetupPasswordForm />;
}

function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Send token to backend for validation and logging
  const validateTokenQuery = trpc.users.validateSetupToken.useQuery(
    { token: token! },
    {
      enabled: !!token,
      retry: false,
    }
  );

  // Form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user info from backend validation
  const userInfo = validateTokenQuery.data?.user || null;

  // Enhanced password validation
  const validatePassword = (pwd: string): PasswordValidation => {
    const requirements: PasswordRequirement[] = [
      { met: pwd.length >= 8, text: "Au moins 8 caractères" },
      { met: /[A-Z]/.test(pwd), text: "Une lettre majuscule" },
      { met: /[a-z]/.test(pwd), text: "Une lettre minuscule" },
      { met: /\d/.test(pwd), text: "Un chiffre" },
      {
        met: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
        text: "Un caractère spécial",
      },
    ];

    const metRequirements = requirements.filter((req) => req.met).length;
    const errors = requirements
      .filter((req) => !req.met)
      .map((req) => req.text);

    let strength: "weak" | "medium" | "strong" = "weak";
    if (metRequirements >= 4) strength = "strong";
    else if (metRequirements >= 3) strength = "medium";

    return {
      isValid: metRequirements >= 4,
      errors,
      strength,
    };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const hasPasswordMismatch = confirmPassword.length > 0 && !passwordsMatch;

  const canSubmit =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    passwordValidation.isValid &&
    passwordsMatch &&
    !isSubmitting;

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStrengthWidth = (strength: string) => {
    switch (strength) {
      case "weak":
        return "w-1/3";
      case "medium":
        return "w-2/3";
      case "strong":
        return "w-full";
      default:
        return "w-0";
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case "weak":
        return "faible";
      case "medium":
        return "moyen";
      case "strong":
        return "fort";
      default:
        return "";
    }
  };

  // Setup password mutation
  const setupPasswordMutation = trpc.users.setupPassword.useMutation({
    onSuccess: async () => {
      toastNotification.success(
        "Succès!",
        "Configuration terminée! Connexion automatique en cours..."
      );

      // Automatically sign in the user after password setup
      try {
        const result = await signIn("credentials", {
          email: userInfo?.email,
          password: password,
          redirect: false,
        });

        if (result?.ok) {
          // Redirect to home page after successful auto-login
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          // If auto-login fails, redirect to signin page
          toastNotification.error(
            "Connexion Automatique Échouée",
            "Votre mot de passe a été configuré. Veuillez vous connecter manuellement."
          );
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
        }
      } catch {
        // Fallback to signin page if auto-login fails
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      }
    },
    onError: (error) => {
      toastNotification.error("Échec de Configuration", error.message);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      toastNotification.error(
        "Erreur de Validation",
        "Veuillez compléter correctement tous les champs requis"
      );
      return;
    }

    if (!token) {
      toastNotification.error(
        "Token Invalide",
        "Token de configuration invalide"
      );
      return;
    }

    setIsSubmitting(true);

    setupPasswordMutation.mutate({
      token,
      password,
      confirmPassword,
    });
  };

  return (
    <div
      className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center"
      suppressHydrationWarning={true}
    >
      <div className="space-y-6" suppressHydrationWarning={true}>
        {/* Show loading state while validating token */}
        {validateTokenQuery.isLoading && (
          <>
            <div className="text-center" suppressHydrationWarning={true}>
              <div
                className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                suppressHydrationWarning={true}
              >
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Validation du Token de Configuration
              </h1>
              <p className="mt-2 text-gray-600">
                Veuillez patienter pendant que nous vérifions votre lien de
                configuration...
              </p>
            </div>
            <Card
              className="shadow-xl border-0"
              suppressHydrationWarning={true}
            >
              <CardContent className="space-y-6 py-8">
                <div className="text-center">
                  <Spinner className="w-8 h-8 text-blue-600 mx-auto" />
                  <p className="mt-2 text-sm text-gray-600">
                    Validation du token...
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Show error state if token validation failed */}
        {validateTokenQuery.isError && (
          <>
            <div className="text-center" suppressHydrationWarning={true}>
              <div
                className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
                suppressHydrationWarning={true}
              >
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Lien de Configuration Invalide
              </h1>
              <p className="mt-2 text-gray-600">
                Ce lien de configuration est invalide ou a expiré. Veuillez
                contacter votre administrateur pour une nouvelle invitation.
              </p>
            </div>
            <Card
              className="shadow-xl border-0"
              suppressHydrationWarning={true}
            >
              <CardContent className="space-y-6 py-8">
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    {validateTokenQuery.error?.message ||
                      "Une erreur inconnue s'est produite"}
                  </p>
                  <Button
                    onClick={() => router.push("/signin")}
                    variant="outline"
                    className="w-full"
                  >
                    Aller à la Connexion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Show main form when token is valid and user info is loaded */}
        {validateTokenQuery.isSuccess && userInfo && (
          <>
            {/* Header */}
            <div className="text-center" suppressHydrationWarning={true}>
              <h1 className="text-3xl font-bold text-gray-900">
                Finaliser la Configuration
              </h1>
              <p className="mt-2 text-gray-600">
                Créez un mot de passe sécurisé pour votre compte DSR
              </p>
            </div>

            <Card
              className="shadow-xl border-0 min-w-[400px]"
              suppressHydrationWarning={true}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Informations du Compte
                    </p>
                    <p className="text-sm text-blue-700">{userInfo.email}</p>
                    <p className="text-xs text-blue-600">
                      Bienvenue, {userInfo.firstName} {userInfo.lastName}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Password Field */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="password" className="text-sm font-medium">
                        Nouveau Mot de Passe
                      </Label>
                    </div>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Créez un mot de passe sécurisé"
                        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
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

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            Force du mot de passe
                          </span>
                          <span
                            className={`text-xs font-medium capitalize ${
                              passwordValidation.strength === "strong"
                                ? "text-green-600"
                                : passwordValidation.strength === "medium"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {getStrengthText(passwordValidation.strength)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(
                              passwordValidation.strength
                            )} ${getStrengthWidth(
                              passwordValidation.strength
                            )}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Password Requirements */}
                    {password && passwordValidation.errors.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">
                          Le mot de passe doit inclure :
                        </p>
                        {passwordValidation.errors.map((error, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                            <span className="text-xs text-red-600">
                              {error}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {passwordValidation.isValid && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          Le mot de passe répond à toutes les exigences
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirmer le Mot de Passe
                    </Label>

                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez votre mot de passe"
                        className={`pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                          hasPasswordMismatch
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-gray-100"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>

                    {hasPasswordMismatch && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600">
                          Les mots de passe ne correspondent pas
                        </span>
                      </div>
                    )}

                    {passwordsMatch && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          Les mots de passe correspondent
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Configuration du mot de passe...
                      </>
                    ) : (
                      <>Finaliser la Configuration</>
                    )}
                  </Button>
                </form>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Besoin d&apos;aide ? Contactez votre administrateur
                      système
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                      onClick={() => router.push("/signin")}
                    >
                      Retour à la Connexion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
