"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";
import { User } from "./user-table";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  isOpen,
  onClose,
  user,
  onSuccess,
}: DeleteUserDialogProps) {
  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Utilisateur désactivé avec succès!");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        `Une erreur est survenue: ${error.message}`
      );
    },
  });

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteUserMutation.mutateAsync({ id: user.id });
    } catch {
      // Error is handled by the mutation
    }
  };

  if (!user) return null;

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Désactiver l&apos;utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Message */}
          <div className="rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Attention : Action irréversible
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Cette action va désactiver le compte utilisateur.
                  L&apos;utilisateur ne pourra plus se connecter au système.
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Informations de l&apos;utilisateur à désactiver :
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nom complet :</span>
                <span className="text-sm font-medium text-gray-900">
                  {fullName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email :</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.email}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rôle :</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.role === "admin" ? "Administrateur" : "Utilisateur"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Statut actuel :</span>
                <span
                  className={`text-sm font-medium ${
                    user.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-700">
              <strong>Note importante :</strong>
            </p>
            <ul className="text-xs text-blue-600 mt-1 list-disc list-inside space-y-1">
              <li>
                Le compte sera désactivé mais les données seront conservées
              </li>
              <li>L&apos;utilisateur ne pourra plus se connecter</li>
              <li>Un administrateur peut réactiver le compte plus tard</li>
              <li>
                Toutes les données associées à cet utilisateur seront préservées
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteUserMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Désactivation en cours...
              </>
            ) : (
              "Confirmer la désactivation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
