"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  isActive: boolean;
}

interface ResetPasswordDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResetPasswordDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: ResetPasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const resetPasswordMutation = trpc.users.initiatePasswordReset.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      toastNotification.success("Réinitialisation envoyée", data.message);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      setIsLoading(false);
      toastNotification.error(
        "Erreur",
        error.message ||
          "Impossible d&apos;envoyer l&apos;email de réinitialisation"
      );
    },
  });

  const handleResetPassword = async () => {
    if (!user) return;

    setIsLoading(true);
    resetPasswordMutation.mutate({ userId: user.id });
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Réinitialiser le mot de passe
          </DialogTitle>
          <DialogDescription className="text-left"></DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Email de réinitialisation
                </h4>
                <p className="text-sm text-blue-800">
                  Un email sera envoyé à <strong>{user?.email}</strong> avec un
                  lien sécurisé pour définir un nouveau mot de passe.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div>
                <h4 className="font-medium text-amber-900 mb-1">
                  Informations importantes
                </h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Le lien de réinitialisation expirera dans 24 heures</li>
                  <li>
                    • L&apos;utilisateur devra créer un nouveau mot de passe
                  </li>
                  <li>• L&apos;ancien mot de passe ne fonctionnera plus</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Envoyer l&apos;email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
