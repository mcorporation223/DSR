"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";
import type { Employee } from "./employees-table";

interface DeleteEmployeeDialogProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteEmployeeDialog({
  employee,
  isOpen,
  onClose,
  onSuccess,
}: DeleteEmployeeDialogProps) {
  const deleteEmployeeMutation = trpc.employees.delete.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Employé supprimé avec succès!");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        `Erreur lors de la suppression: ${error.message}`
      );
    },
  });

  const handleDelete = async () => {
    try {
      await deleteEmployeeMutation.mutateAsync({ id: employee.id });
    } catch {
      // Error is handled by the mutation
    }
  };

  const fullName =
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    "Employé sans nom";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Supprimer l&apos;employé
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer{" "}
            <span className="font-medium text-gray-900">{fullName}</span> ?
            <br />
            <br />
            Cette action désactivera l&apos;employé dans le système.
            L&apos;employé n&apos;apparaîtra plus dans la liste des employés
            actifs, mais ses données seront conservées dans le système.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteEmployeeMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteEmployeeMutation.isPending}
          >
            {deleteEmployeeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
