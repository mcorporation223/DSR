"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Upload, FileText, Loader2, X, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/components/trpc-provider";
import { useState, useRef } from "react";
import { toastNotification } from "@/components/toast-notification";
import {
  uploadFile,
  validateDocumentFile,
  formatFileSize,
} from "@/lib/upload-utils";

// Form validation schema
const statementFormSchema = z.object({
  file: z.instanceof(File).optional(),
  fileUrl: z.string().min(1, "Un fichier doit être sélectionné"),
  detaineeId: z.string().min(1, "Un détenu doit être sélectionné"),
});

type StatementFormValues = z.infer<typeof statementFormSchema>;

interface StatementFormProps {
  onSubmit?: (data: StatementFormValues) => void;
  onSuccess?: () => void;
}

export function StatementForm({ onSubmit, onSuccess }: StatementFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [detaineeSearch, setDetaineeSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<StatementFormValues>({
    resolver: zodResolver(statementFormSchema),
    defaultValues: {
      fileUrl: "",
      detaineeId: "",
    },
  });

  // TRPC query for searching detainees
  const { data: detainees = [] } = trpc.detainees.search.useQuery(
    { query: detaineeSearch, limit: 10 },
    { enabled: detaineeSearch.length >= 2 }
  );

  // TRPC mutation for creating statements
  const createStatementMutation = trpc.statements.create.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      form.reset();
      setSelectedFile(null);
      setDetaineeSearch("");
      onSuccess?.();
      toastNotification.success(
        "Déclaration créée avec succès",
        "La nouvelle déclaration a été ajoutée à la base de données."
      );
    },
    onError: (error) => {
      console.error("Error creating statement:", error);
      toastNotification.error(
        "Erreur lors de la création",
        error.message ||
          "Une erreur s'est produite lors de la création de la déclaration."
      );
    },
  });

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
    form.setValue("fileUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (data: StatementFormValues) => {
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

      // Create statement with file URL and detainee ID
      const statementData = {
        fileUrl: `/api/files/${uploadResult.filePath}`,
        detaineeId: data.detaineeId,
      };

      createStatementMutation.mutate(statementData);
      onSubmit?.(data);
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

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closing
      form.reset();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className="">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Déclaration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Ajouter une nouvelle déclaration</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="border-t border-gray-200"></div>

                <div className="p-4 space-y-6">
                  {/* Detainee Selection */}
                  <FormField
                    control={form.control}
                    name="detaineeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Sélectionner un détenu *
                        </FormLabel>
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Rechercher un détenu par nom..."
                              value={detaineeSearch}
                              onChange={(e) =>
                                setDetaineeSearch(e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                          {detaineeSearch.length >= 2 &&
                            detainees.length > 0 && (
                              <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                                {detainees.map((detainee) => (
                                  <button
                                    key={detainee.id}
                                    type="button"
                                    onClick={() => {
                                      field.onChange(detainee.id);
                                      setDetaineeSearch(
                                        `${detainee.firstName} ${detainee.lastName}`
                                      );
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="font-medium text-sm">
                                      {detainee.firstName} {detainee.lastName}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          {field.value && (
                            <div className="text-sm text-green-600 font-medium">
                              ✓ Détenu sélectionné
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload */}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 px-4 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={createStatementMutation.isPending || isUploading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createStatementMutation.isPending ||
                    isUploading ||
                    !selectedFile
                  }
                >
                  {createStatementMutation.isPending || isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isUploading ? "Téléchargement..." : "Création..."}
                    </>
                  ) : (
                    "Ajouter la déclaration"
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

// Export the form values type for use in other components
export type { StatementFormValues };
