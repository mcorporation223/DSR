"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Upload,
  FileText,
  X,
  MoreHorizontal,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/components/trpc-provider";
import { useState, useRef } from "react";
import { toastNotification } from "@/components/toast-notification";
import {
  uploadFile,
  validateDocumentFile,
  formatFileSize,
  getFileUrl,
} from "@/lib/upload-utils";

interface Statement {
  id: string;
  fileUrl: string;
  detaineeId: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdByName: string | null;
  updatedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DetaineeStatementsSectionProps {
  detaineeId: string;
  detaineeName: string;
}

export function DetaineeStatementsSection({
  detaineeId,
  detaineeName,
}: DetaineeStatementsSectionProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingStatement, setDeletingStatement] = useState<Statement | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch statements for this detainee
  const {
    data: statements = [],
    isLoading,
    refetch,
  } = trpc.statements.getByDetaineeId.useQuery({ detaineeId });

  // TRPC mutations
  const createStatementMutation = trpc.statements.create.useMutation({
    onSuccess: () => {
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      refetch();
      toastNotification.success(
        "Déclaration ajoutée",
        "La déclaration a été ajoutée avec succès."
      );
    },
    onError: (error) => {
      console.error("Error creating statement:", error);
      toastNotification.error(
        "Erreur",
        error.message || "Une erreur s'est produite lors de l'ajout."
      );
    },
  });

  const deleteStatementMutation = trpc.statements.delete.useMutation({
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setDeletingStatement(null);
      refetch();
      toastNotification.success(
        "Déclaration supprimée",
        "La déclaration a été supprimée avec succès."
      );
    },
    onError: (error) => {
      console.error("Error deleting statement:", error);
      toastNotification.error(
        "Erreur",
        error.message || "Une erreur s'est produite lors de la suppression."
      );
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateDocumentFile(file);
    if (validationError) {
      toastNotification.error("Fichier invalide", validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadStatement = async () => {
    if (!selectedFile) {
      toastNotification.error(
        "Fichier requis",
        "Veuillez sélectionner un fichier."
      );
      return;
    }

    try {
      setIsUploading(true);

      // Upload file first
      const uploadResult = await uploadFile(selectedFile, "statement");

      if (!uploadResult.success) {
        throw new Error(
          uploadResult.error || "Échec du téléchargement du fichier"
        );
      }

      // Create statement
      createStatementMutation.mutate({
        fileUrl: `${uploadResult.filePath}`,
        detaineeId,
      });
    } catch (error) {
      console.error("Error in upload:", error);
      toastNotification.error(
        "Erreur",
        error instanceof Error ? error.message : "Une erreur s'est produite"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteStatement = (statement: Statement) => {
    setDeletingStatement(statement);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingStatement) {
      deleteStatementMutation.mutate({ id: deletingStatement.id });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsUploadDialogOpen(open);
    if (!open) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-gray-900 border-b pb-2">
        <h3 className="text-lg font-medium flex-1">
          Déclarations
        </h3>
        <Button
          onClick={() => setIsUploadDialogOpen(true)}
          size="sm"
          variant="outline"
          className="cursor-pointer border-dashed border-blue-500 hover:border-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {/* Ajouter */}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="w-5 h-5 text-blue-500" />
          <span className="ml-2 text-sm text-gray-600">
            Chargement des déclarations...
          </span>
        </div>
      ) : statements.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Aucune déclaration
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Aucune déclaration n&apos;a encore été ajoutée pour ce détenu.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {statements.map((statement) => (
            <div
              key={statement.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
            >
              <div
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={() =>
                  window.open(getFileUrl(statement.fileUrl), "_blank")
                }
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Déclaration
                  </p>
                  <p className="text-xs text-gray-500">
                    Ajouté le {formatDateTime(statement.createdAt)}
                    {statement.createdByName &&
                      ` par ${statement.createdByName}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(getFileUrl(statement.fileUrl), "_blank")
                      }
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteStatement(statement)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Ajouter une déclaration pour {detaineeName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Fichier de déclaration</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  selectedFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />

                {!selectedFile ? (
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        Cliquez pour télécharger un fichier
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, Word, TXT ou images jusqu&apos;à 10MB
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={createStatementMutation.isPending || isUploading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUploadStatement}
                disabled={
                  createStatementMutation.isPending ||
                  isUploading ||
                  !selectedFile
                }
              >
                {createStatementMutation.isPending || isUploading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    {isUploading ? "Téléchargement..." : "Ajout..."}
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer la déclaration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette déclaration ? Cette
              action est irréversible.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteStatementMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteStatementMutation.isPending}
              >
                {deleteStatementMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
