"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Upload } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { trpc } from "@/components/trpc-provider";
import {
  uploadFile,
  validateImageFile,
  getFileUrl,
  deleteFile,
} from "@/lib/upload-utils";
import { toastNotification } from "@/components/toast-notification";

export interface Seizure {
  id: string;
  itemName: string;
  type: string;
  details: string | null;
  seizureLocation: string | null;
  ownerName: string | null;
  ownerResidence: string | null;
  seizureDate: Date;
  status: string | null;
  releaseDate: Date | null;
  photoUrl: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Form validation schema matching the backend update schema
const editSeizureFormSchema = z.object({
  itemName: z.string().min(1, "Le nom de l'objet est requis"),
  type: z.enum(["vehicule", "objet"], {
    message: "Sélectionner le type",
  }),
  details: z.string().optional(),
  seizureLocation: z.string().optional(),
  ownerName: z.string().optional(),
  ownerResidence: z.string().optional(),
  seizureDate: z.date({
    message: "La date de saisie est requise",
  }),
  status: z.enum(["in_custody", "released"], {
    message: "Sélectionner le statut",
  }),
  releaseDate: z.date().optional().nullable(),
  photoUrl: z.string().optional(),
});

type EditSeizureFormValues = z.infer<typeof editSeizureFormSchema>;

interface EditSeizureFormProps {
  seizure: Seizure | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditSeizureForm({
  seizure,
  isOpen,
  onClose,
  onSuccess,
}: EditSeizureFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newlyUploadedFile, setNewlyUploadedFile] = useState<string | null>(
    null
  );
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TRPC mutation for updating seizure
  const updateSeizure = trpc.seizures.update.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Saisie modifiée avec succès");
      setNewlyUploadedFile(null);
      setOriginalPhotoUrl(form.getValues("photoUrl") || null);
      onClose();
      onSuccess?.();
    },
    onError: async (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la modification de la saisie"
      );

      // Delete newly uploaded file if seizure update fails
      if (newlyUploadedFile) {
        await deleteFile(newlyUploadedFile);
        setNewlyUploadedFile(null);

        // Restore original photo URL in form
        if (originalPhotoUrl) {
          form.setValue("photoUrl", originalPhotoUrl);
        }
      }
    },
  });

  const form = useForm<EditSeizureFormValues>({
    resolver: zodResolver(editSeizureFormSchema),
    defaultValues: {
      itemName: "",
      type: "vehicule",
      details: "",
      seizureLocation: "",
      ownerName: "",
      ownerResidence: "",
      seizureDate: new Date(),
      status: "in_custody",
      releaseDate: null,
      photoUrl: "",
    },
  });

  // Reset and populate form when seizure changes
  useEffect(() => {
    if (seizure && isOpen) {
      // Set image preview for existing seizure photo
      if (seizure.photoUrl) {
        const imageUrl = getFileUrl(seizure.photoUrl);
        setOriginalPhotoUrl(seizure.photoUrl);

        // Test if the image can be loaded
        const img = document.createElement("img");
        img.onload = () => setImagePreview(imageUrl);
        img.onerror = () => {
          console.warn("Failed to load seizure photo:", imageUrl);
          setImagePreview(null);
        };
        img.src = imageUrl;
      } else {
        setImagePreview(null);
        setOriginalPhotoUrl(null);
      }

      // Reset newly uploaded file tracking
      setNewlyUploadedFile(null);

      form.reset({
        itemName: seizure.itemName || "",
        type: (seizure.type as "vehicule" | "objet") || "vehicule",
        details: seizure.details || "",
        seizureLocation: seizure.seizureLocation || "",
        ownerName: seizure.ownerName || "",
        ownerResidence: seizure.ownerResidence || "",
        seizureDate: seizure.seizureDate || new Date(),
        status: (seizure.status as "in_custody" | "released") || "in_custody",
        releaseDate: seizure.releaseDate || null,
        photoUrl: seizure.photoUrl || "",
      });
    }
  }, [seizure, isOpen, form]);

  const handleSubmit = (data: EditSeizureFormValues) => {
    if (!seizure) return;

    // Prevent submission while file is uploading
    if (isUploading) {
      toastNotification.error(
        "Upload en cours",
        "Veuillez attendre que le téléchargement de la photo soit terminé"
      );
      return;
    }

    const formData = {
      id: seizure.id,
      ...data,
      seizureDate: data.seizureDate.toISOString(),
      releaseDate: data.releaseDate ? data.releaseDate.toISOString() : null,
    };

    updateSeizure.mutate(formData);
  };

  const handleClose = async () => {
    // If there's a newly uploaded file that wasn't saved
    if (newlyUploadedFile && newlyUploadedFile !== originalPhotoUrl) {
      await deleteFile(newlyUploadedFile);
      setNewlyUploadedFile(null);

      // Restore original photo
      if (originalPhotoUrl) {
        form.setValue("photoUrl", originalPhotoUrl);
        const imageUrl = getFileUrl(originalPhotoUrl);
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }
    }

    form.reset();
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      toastNotification.error("Erreur de fichier", validationError);
      return;
    }
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);

      // Upload file
      const uploadResult = await uploadFile(file, "seizure");

      if (uploadResult.success && uploadResult.filePath) {
        // Delete old file when replacing
        if (originalPhotoUrl && originalPhotoUrl !== uploadResult.filePath) {
          await deleteFile(originalPhotoUrl);
        }

        // Delete previously uploaded file if user uploads again before submitting
        if (newlyUploadedFile && newlyUploadedFile !== uploadResult.filePath) {
          await deleteFile(newlyUploadedFile);
        }

        // Track this newly uploaded file for potential cleanup
        setNewlyUploadedFile(uploadResult.filePath);

        form.setValue("photoUrl", uploadResult.filePath);
        toastNotification.success("Succès", "Photo téléchargée avec succès!");
      } else {
        throw new Error(uploadResult.error || "Échec du téléchargement");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toastNotification.error(
        "Erreur de téléchargement",
        "Erreur lors du téléchargement de la photo"
      );
      setImagePreview(originalPhotoUrl ? getFileUrl(originalPhotoUrl) : null);
      form.setValue("photoUrl", originalPhotoUrl || "");
    } finally {
      setIsUploading(false);
    }
  };

  if (!seizure) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Modifier la saisie: {seizure.itemName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="border-t border-gray-200"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Nom</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Toyota Corolla ou Honda CB125"
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs " />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vehicule">Vehicule</SelectItem>
                            <SelectItem value="objet">Objet</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs " />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">Détails</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Détails supplémentaires..."
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs " />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">
                          Photo de l&apos;objet saisi
                        </FormLabel>
                        <FormControl>
                          <Input type="hidden" {...field} />
                        </FormControl>
                        <div
                          className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors min-h-[120px]"
                          onClick={triggerFileInput}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isUploading}
                          />

                          {isUploading ? (
                            <>
                              <Spinner className="h-8 w-8 text-blue-600 mb-1" />
                              <div className="text-blue-600 font-medium">
                                Téléchargement en cours...
                              </div>
                            </>
                          ) : !imagePreview ? (
                            <>
                              <Upload className="h-8 w-8 text-gray-400 mb-1" />
                              <div className="text-blue-600 font-medium">
                                Télécharger une photo
                              </div>
                              <div className="text-xs text-gray-500">
                                PNG, JPG, GIF jusqu&apos;à 5MB
                              </div>
                            </>
                          ) : (
                            <div className="w-full flex items-center gap-4">
                              <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                                <Image
                                  src={imagePreview}
                                  alt="Aperçu de la photo"
                                  fill
                                  className="object-cover"
                                  onError={() => {
                                    console.error(
                                      "Failed to load image:",
                                      imagePreview
                                    );
                                    setImagePreview(null);
                                  }}
                                  unoptimized={imagePreview.startsWith(
                                    "/api/files"
                                  )}
                                />
                              </div>
                              <div className="flex-1 flex flex-col">
                                <p className="text-sm font-medium truncate">
                                  Photo sélectionnée
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Cliquez pour changer la photo
                                </p>
                              </div>
                              <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Cliquez sur la zone pour télécharger une photo de
                          l&apos;objet saisi.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Owner Information Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Nom du propriétaire
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Pierre Mukamba Tshimanga"
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs " />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerResidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Résidence du propriétaire
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Goma, Quartier Volcano"
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs " />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Seizure Information Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <FormField
                    control={form.control}
                    name="seizureDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Date de saisie
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", {
                                    locale: fr,
                                  })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("2000-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs " />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seizureLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Lieu de saisie
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Goma Centre" {...field} />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs " />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">Statut</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner le statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in_custody">En garde</SelectItem>
                            <SelectItem value="released">Restitué</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs " />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Show release date field if status is released */}
                  {form.watch("status") === "released" && (
                    <FormField
                      control={form.control}
                      name="releaseDate"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-gray-700">
                            Date de restitution
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-full justify-start text-left font-normal ${
                                    !field.value && "text-muted-foreground"
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", {
                                      locale: fr,
                                    })
                                  ) : (
                                    <span>
                                      Sélectionner date de restitution
                                    </span>
                                  )}
                                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                captionLayout="dropdown"
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <div className="max-h-[0.5rem]">
                            <FormMessage className="text-xs " />
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 px-4 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={updateSeizure.isPending || isUploading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateSeizure.isPending || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Téléchargement...
                    </>
                  ) : updateSeizure.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Modification en cours...
                    </>
                  ) : (
                    "Modifier la saisie"
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
