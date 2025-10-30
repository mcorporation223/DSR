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
import { formatDate } from "@/lib/formatters";

interface Report {
  id: string;
  title: string;
  content: string | null;
  reportDate: Date;
}

interface DeleteReportDialogProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteReportDialog({
  report,
  isOpen,
  onClose,
  onSuccess,
}: DeleteReportDialogProps) {
  const deleteReportMutation = trpc.reports.delete.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Rapport supprimé avec succès");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la suppression du rapport"
      );
    },
  });

  const handleDelete = () => {
    if (!report) return;
    deleteReportMutation.mutate({ id: report.id });
  };

  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Supprimer le Rapport
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Êtes-vous sûr de vouloir supprimer ce rapport ?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="font-medium">Titre:</span> {report.title}
          </div>
          <div className="text-sm">
            <span className="font-medium">Date:</span>{" "}
            {formatDate(report.reportDate)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Contenu:</span>{" "}
            <span className="text-gray-600">
              {report.content
                ? report.content.length > 100
                  ? `${report.content.substring(0, 100)}...`
                  : report.content
                : "N/A"}
            </span>
          </div>
        </div>

        <div className=" p-3 rounded-lg">
          <p className="text-red-800 text-sm font-medium">
            ⚠️ Cette action est irréversible
          </p>
          <p className="text-red-700 text-sm mt-1">
            Toutes les données liées à ce rapport seront définitivement
            supprimées.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteReportMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteReportMutation.isPending}
            className="min-w-[120px]"
          >
            {deleteReportMutation.isPending ? (
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
