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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload, FileText, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState, useRef } from "react";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";
import {
  uploadFile,
  validateDocumentFile,
  formatFileSize,
} from "@/lib/upload-utils";
import type { Statement } from "./statements-table";

// Form validation schema
const editStatementFormSchema = z.object({
  file: z.instanceof(File).optional(),
  fileUrl: z.string().min(1, "Un fichier doit être sélectionné"),
  detaineeId: z.string().min(1, "Un détenu doit être sélectionné"),
});

type EditStatementFormValues = z.infer<typeof editStatementFormSchema>;

interface EditStatementFormProps {
  statement: Statement | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditStatementForm({
  statement,
  isOpen,
  onClose,
  onSuccess,
}: EditStatementFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TRPC mutation for updating statement
  const updateStatement = trpc.statements.update.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Déclaration modifiée avec succès");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la modification de la déclaration"
      );
    },
  });

  const form = useForm<EditStatementFormValues>({
    resolver: zodResolver(editStatementFormSchema),
    defaultValues: {
      fileUrl: "",
    },
  });

  // Update form when statement changes
  useEffect(() => {
    if (statement && isOpen) {
      form.reset({
        fileUrl: statement.fileUrl,
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [statement, isOpen, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateDocumentFile(file);
    if (validationError) {
      toastNotification.error("Fichier invalide", validationError);
      return;
    }

    setSelectedFile(file);
    form.setValue("fileUrl", file.name); // Temporary value for validation
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Reset to original file URL if no new file selected
    if (statement) {
      form.setValue("fileUrl", statement.fileUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = async (_data: EditStatementFormValues) => {
    if (!statement) return;

    try {
      setIsUploading(true);
      let finalFileUrl = statement.fileUrl;

      // If a new file was selected, upload it
      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile, "statement");

        if (!uploadResult.success) {
          throw new Error(
            uploadResult.error || "Échec du téléchargement du fichier"
          );
        }

        finalFileUrl = `/api/files/${uploadResult.filePath}`;
      }

      // Update statement with file URL
      const updateData = {
        id: statement.id,
        fileUrl: finalFileUrl,
      };

      updateStatement.mutate(updateData);
    } catch (error) {
      console.error("Error in form submission:", error);
      toastNotification.error(
        "Erreur",
        error instanceof Error ? error.message : "Une erreur s'est produite"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Modifier la Déclaration
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Vous pouvez remplacer le fichier actuel en sélectionnant un nouveau
            fichier.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 px-6"
            >
              <FormField
                control={form.control}
                name="fileUrl"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: _ }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Fichier de déclaration
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Current File Display */}
                        {!selectedFile && statement && (
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-6 h-6 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Fichier actuel:
                                </p>
                                <p className="text-sm text-gray-600">
                                  {getFileName(statement.fileUrl)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* File Upload Area */}
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
                            id="file-upload-edit"
                          />

                          {!selectedFile ? (
                            <label
                              htmlFor="file-upload-edit"
                              className="cursor-pointer flex flex-col items-center space-y-2"
                            >
                              <Upload className="w-6 h-6 text-gray-400" />
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900">
                                  Cliquez pour remplacer le fichier
                                </p>
                                <p className="text-xs text-gray-500">
                                  PDF, Word, TXT ou images jusqu&apos;à 10MB
                                </p>
                              </div>
                            </label>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-6 h-6 text-green-600" />
                                <div className="text-left">
                                  <p className="text-sm font-medium text-gray-900">
                                    Nouveau fichier: {selectedFile.name}
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
                    </FormControl>
                    <div className="h-[24px]">
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 pt-4 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={updateStatement.isPending || isUploading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateStatement.isPending || isUploading}
                >
                  {updateStatement.isPending || isUploading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      {isUploading ? "Téléchargement..." : "Modification..."}
                    </>
                  ) : (
                    "Modifier la déclaration"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
