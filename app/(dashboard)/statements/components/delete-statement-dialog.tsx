"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";
import { Loader2 } from "lucide-react";
import { formatDetailedDateTime } from "@/lib/formatters";

interface Statement {
  id: string;
  fileUrl: string;
  createdAt: Date;
}

interface DeleteStatementDialogProps {
  statement: Statement | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteStatementDialog({
  statement,
  isOpen,
  onClose,
  onSuccess,
}: DeleteStatementDialogProps) {
  const deleteStatementMutation = trpc.statements.delete.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Déclaration supprimée avec succès");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la suppression de la déclaration"
      );
    },
  });

  const handleDelete = () => {
    if (!statement) return;
    deleteStatementMutation.mutate({ id: statement.id });
  };

  const getFileName = (fileUrl: string) => {
    try {
      const url = new URL(fileUrl, window.location.origin);
      const pathname = url.pathname;
      const fileName = pathname.split("/").pop() || fileUrl;
      return fileName;
    } catch {
      return fileUrl;
    }
  };

  if (!statement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Supprimer la Déclaration
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Êtes-vous sûr de vouloir supprimer cette déclaration ?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="font-medium">Fichier:</span>{" "}
            <span className="text-blue-600">
              {getFileName(statement.fileUrl)}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Date de création:</span>{" "}
            {formatDetailedDateTime(statement.createdAt)}
          </div>
        </div>

        <div className="p-3 rounded-lg">
          <p className="text-red-800 text-sm font-medium">
            ⚠️ Cette action est irréversible
          </p>
          <p className="text-red-700 text-sm mt-1">
            La déclaration sera définitivement supprimée de la base de données.
            Le fichier associé pourra également être supprimé du serveur.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteStatementMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteStatementMutation.isPending}
            className="min-w-[120px]"
          >
            {deleteStatementMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>Supprimer</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
