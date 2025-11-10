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
import type { Seizure } from "./seizure-table";

interface DeleteSeizureDialogProps {
  seizure: Seizure | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteSeizureDialog({
  seizure,
  isOpen,
  onClose,
  onSuccess,
}: DeleteSeizureDialogProps) {
  // TRPC mutation for deleting seizure
  const deleteSeizure = trpc.seizures.delete.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Saisie supprimée avec succès");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la suppression de la saisie"
      );
    },
  });

  const handleDelete = () => {
    if (!seizure) return;

    deleteSeizure.mutate({
      id: seizure.id,
    });
  };

  const handleClose = () => {
    if (!deleteSeizure.isPending) {
      onClose();
    }
  };

  if (!seizure) return null;

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
            Êtes-vous sûr de vouloir supprimer cette saisie ?
          </p>

          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium text-gray-900">
                  {seizure.itemName || "Nom non disponible"}
                </div>
                <div className="text-sm text-gray-500">
                  {seizure.type} -{" "}
                  {seizure.plateNumber || "Plaque non spécifiée"}
                </div>
                {seizure.ownerName && (
                  <div className="text-sm text-gray-500">
                    Propriétaire: {seizure.ownerName}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-red-600 mt-3 font-medium">
            ⚠️ Cette action est irréversible. Toutes les données associées à
            cette saisie seront définitivement supprimées.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleteSeizure.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSeizure.isPending}
          >
            {deleteSeizure.isPending && <Spinner className="w-4 h-4 mr-2" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
