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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";

interface Incident {
  id: string;
  incidentDate: Date;
  location: string;
  eventType: string;
  numberOfVictims: number | null;
}

interface DeleteIncidentDialogProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteIncidentDialog({
  incident,
  isOpen,
  onClose,
  onSuccess,
}: DeleteIncidentDialogProps) {
  const deleteIncidentMutation = trpc.incidents.delete.useMutation({
    onSuccess: () => {
      toast.success("Incident supprimé avec succès");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.message || "Erreur lors de la suppression de l'incident"
      );
    },
  });

  const handleDelete = () => {
    if (!incident) return;
    deleteIncidentMutation.mutate({ id: incident.id });
  };

  if (!incident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Supprimer l&apos;Incident
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Êtes-vous sûr de vouloir supprimer cet incident ?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="font-medium">Type:</span> {incident.eventType}
          </div>
          <div className="text-sm">
            <span className="font-medium">Date:</span>{" "}
            {formatDate(incident.incidentDate)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Lieu:</span> {incident.location}
          </div>
          {incident.numberOfVictims && incident.numberOfVictims > 0 && (
            <div className="text-sm">
              <span className="font-medium">Victimes:</span>{" "}
              {incident.numberOfVictims}
            </div>
          )}
        </div>

        <div className=" p-3 rounded-lg">
          <p className="text-red-800 text-sm font-medium">
            ⚠️ Cette action est irréversible
          </p>
          <p className="text-red-700 text-sm mt-1">
            Toutes les données liées à cet incident, y compris les victimes,
            seront définitivement supprimées.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteIncidentMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteIncidentMutation.isPending}
            className="min-w-[120px]"
          >
            {deleteIncidentMutation.isPending ? (
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
