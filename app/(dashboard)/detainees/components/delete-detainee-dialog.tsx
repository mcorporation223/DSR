"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";
import type { Detainee } from "./detainee-table";

interface DeleteDetaineeDialogProps {
  detainee: Detainee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteDetaineeDialog({
  detainee,
  isOpen,
  onClose,
  onSuccess,
}: DeleteDetaineeDialogProps) {
  // TRPC mutation for deleting detainee
  const deleteDetainee = trpc.detainees.delete.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Détenu supprimé avec succès");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la suppression du détenu"
      );
    },
  });

  const handleDelete = () => {
    if (!detainee) return;

    deleteDetainee.mutate({
      id: detainee.id,
    });
  };

  const handleClose = () => {
    if (!deleteDetainee.isPending) {
      onClose();
    }
  };

  if (!detainee) return null;

  const fullName = `${detainee.firstName || ""} ${
    detainee.lastName || ""
  }`.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Confirmer la suppression
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700 mb-2">
            Êtes-vous sûr de vouloir supprimer ce détenu ?
          </p>

          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-600">
                  {fullName
                    ? fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "D"}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {fullName || "Nom non disponible"}
                </div>
                <div className="text-sm text-gray-500">
                  {detainee.crimeReason || "Motif non spécifié"}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-red-600 mt-3 font-medium">
            ⚠️ Cette action est irréversible. Toutes les données associées à ce
            détenu seront définitivement supprimées.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleteDetainee.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDetainee.isPending}
          >
            {deleteDetainee.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
