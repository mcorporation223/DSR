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
import type { Detainee } from "./detainee-table";

// Form validation schema matching the database schema
const editDetaineeFormSchema = z.object({
  firstName: z.string().min(2, "Min 2 caractères").max(20, "Max 20 caractères"),
  lastName: z.string().min(2, "Min 2 caractères").max(20, "Max 20 caractères"),
  sex: z.enum(["Male", "Female"], {
    message: "Sélectionner le sexe",
  }),
  placeOfBirth: z.string().min(2, "Requis").max(20, "Max 20 caractères"),
  dateOfBirth: z
    .date({
      message: "Date requise",
    })
    .max(new Date(), "Date trop récente")
    .min(new Date("1940-01-01"), "Date trop ancienne"),
  photoUrl: z.string().optional(),
  parentNames: z.string().max(100, "Max 100 caractères").optional(),
  originNeighborhood: z.string().max(25, "Max 25 caractères").optional(),
  education: z.string().max(30, "Max 30 caractères").optional(),
  employment: z.string().max(25, "Max 25 caractères").optional(),
  maritalStatus: z
    .enum(["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"])
    .optional(),
  numberOfChildren: z.number().int().min(0).max(50).optional(),
  spouseName: z.string().max(100, "Max 100 caractères").optional(),
  religion: z.string().max(25, "Max 25 caractères").optional(),
  residence: z.string().min(2, "Requis").max(25, "Max 25 caractères"),
  phoneNumber: z
    .string()
    .regex(
      /^\+[1-9]\d{1,3}\s?[0-9\s]{6,14}$/,
      "Format: +XXX suivi de 6-12 chiffres"
    )
    .refine(
      (val) => {
        // Remove all spaces and check if it has the right format for international numbers
        const digitsOnly = val.replace(/\s/g, "");
        const match = digitsOnly.match(/^\+([1-9]\d{1,3})(\d+)$/);
        if (!match) return false;

        const countryCode = match[1];
        const number = match[2];

        // Country code should be 1-4 digits, number should be 6-12 digits
        return (
          countryCode.length >= 1 &&
          countryCode.length <= 4 &&
          number.length >= 6 &&
          number.length <= 12
        );
      },
      { message: "Format international requis: +XXX suivi de 6-12 chiffres" }
    )
    .optional()
    .or(z.literal("")),
  crimeReason: z.string().min(2, "Requis").max(200, "Max 200 caractères"),
  arrestDate: z.date({
    message: "Date requise",
  }),
  arrestLocation: z.string().min(2, "Requis").max(100, "Max 100 caractères"),
  arrestedBy: z.string().max(100, "Max 100 caractères").optional(),
  arrivalDate: z.date().optional(),
  location: z.string().max(50, "Max 50 caractères").optional(),

  // Status management fields
  status: z.enum(["in_custody", "released", "transferred"], {
    message: "Sélectionner le statut",
  }),
  releaseDate: z.date().optional(),
  releaseReason: z.string().max(500, "Max 500 caractères").optional(),
  transferDestination: z.string().max(255, "Max 255 caractères").optional(),
});

type EditDetaineeFormValues = z.infer<typeof editDetaineeFormSchema>;

interface EditDetaineeFormProps {
  detainee: Detainee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditDetaineeForm({
  detainee,
  isOpen,
  onClose,
  onSuccess,
}: EditDetaineeFormProps) {
  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track uploaded files for cleanup
  const [newlyUploadedFile, setNewlyUploadedFile] = useState<string | null>(
    null
  );
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);

  // TRPC mutation for updating detainee
  const updateDetainee = trpc.detainees.update.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Détenu modifié avec succès");
      setNewlyUploadedFile(null); // Clear tracking on success
      setOriginalPhotoUrl(form.getValues("photoUrl") || null); // Update original to current
      onClose();
      onSuccess?.();
    },
    onError: async (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la modification du détenu"
      );

      // Delete newly uploaded file if detainee update fails
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

  const form = useForm<EditDetaineeFormValues>({
    resolver: zodResolver(editDetaineeFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      sex: undefined,
      placeOfBirth: "",
      dateOfBirth: undefined,
      photoUrl: "",
      parentNames: "",
      originNeighborhood: "",
      education: "",
      employment: "",
      maritalStatus: undefined,
      numberOfChildren: undefined,
      spouseName: "",
      religion: "",
      residence: "",
      phoneNumber: "",
      crimeReason: "",
      arrestDate: undefined,
      arrestLocation: "",
      arrestedBy: "",
      arrivalDate: undefined,
      location: "",
      status: undefined,
      releaseDate: undefined,
      releaseReason: "",
      transferDestination: "",
    },
  });

  // Image upload functions
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
      const uploadResult = await uploadFile(file, "detainee");

      if (uploadResult.success && uploadResult.filePath) {
        // Delete old file when replacing (edit mode only)
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
      setImagePreview(null);
      form.setValue("photoUrl", "");
    } finally {
      setIsUploading(false);
    }
  };

  // Reset and populate form when detainee changes
  useEffect(() => {
    if (detainee && isOpen) {
      // Set image preview for existing detainee photo
      if (detainee.photoUrl) {
        const imageUrl = getFileUrl(detainee.photoUrl as string);
        // Track original photo URL for cleanup when replacing
        setOriginalPhotoUrl(detainee.photoUrl as string);

        // Test if the image can be loaded
        const img = document.createElement("img");
        img.onload = () => setImagePreview(imageUrl);
        img.onerror = () => {
          console.warn("Failed to load detainee photo:", imageUrl);
          setImagePreview(null);
        };
        img.src = imageUrl;
      } else {
        setImagePreview(null);
        setOriginalPhotoUrl(null);
      }

      // Reset newly uploaded file tracking when loading a detainee
      setNewlyUploadedFile(null);

      form.reset({
        firstName: detainee.firstName || "",
        lastName: detainee.lastName || "",
        sex: detainee.sex as "Male" | "Female",
        placeOfBirth: detainee.placeOfBirth || "",
        dateOfBirth: detainee.dateOfBirth
          ? new Date(detainee.dateOfBirth)
          : undefined,
        photoUrl: (detainee.photoUrl as string) || "",
        parentNames: detainee.parentNames || "",
        originNeighborhood: detainee.originNeighborhood || "",
        education: detainee.education || "",
        employment: detainee.employment || "",
        maritalStatus: detainee.maritalStatus as
          | "Célibataire"
          | "Marié(e)"
          | "Divorcé(e)"
          | "Veuf(ve)"
          | undefined,
        numberOfChildren: (detainee.numberOfChildren as number) || undefined,
        spouseName: (detainee.spouseName as string) || "",
        religion: detainee.religion || "",
        residence: detainee.residence || "",
        phoneNumber: detainee.phoneNumber || "",
        crimeReason: detainee.crimeReason || "",
        arrestDate: detainee.arrestDate
          ? new Date(detainee.arrestDate)
          : undefined,
        arrestLocation: detainee.arrestLocation || "",
        arrestedBy: detainee.arrestedBy || "",
        arrivalDate: detainee.arrivalDate
          ? new Date(detainee.arrivalDate as string)
          : undefined,
        location: detainee.location || "",
        status: detainee.status as
          | "in_custody"
          | "released"
          | "transferred"
          | undefined,
        releaseDate: detainee.releaseDate
          ? new Date(detainee.releaseDate)
          : undefined,
        releaseReason: detainee.releaseReason || "",
        transferDestination: detainee.transferDestination || "",
      });
    }
  }, [detainee, isOpen, form]);

  const handleSubmit = (data: EditDetaineeFormValues) => {
    if (!detainee) return;

    // Prevent submission while file is uploading
    if (isUploading) {
      toastNotification.error(
        "Upload en cours",
        "Veuillez attendre que le téléchargement de la photo soit terminé"
      );
      return;
    }

    updateDetainee.mutate({
      id: detainee.id,
      ...data,
    });
  };

  const handleClose = async () => {
    // If there's a newly uploaded file that wasn't saved, delete it
    if (newlyUploadedFile && newlyUploadedFile !== originalPhotoUrl) {
      await deleteFile(newlyUploadedFile);
      setNewlyUploadedFile(null);

      // Restore original photo in form
      if (originalPhotoUrl) {
        form.setValue("photoUrl", originalPhotoUrl);
      }
    }

    form.reset();
    onClose();
  };

  if (!detainee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>
            Modifier le détenu: {detainee.firstName} {detainee.lastName}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Prénom</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Pierre"
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Nom</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mukamba"
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Sexe</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner le sexe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Homme</SelectItem>
                            <SelectItem value="Female">Femme</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Date de naissance
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
                              startMonth={new Date("1940-01-01")}
                              endMonth={new Date()}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1940-01-01")
                              }
                              initialFocus
                              defaultMonth={new Date("1985-01-01")}
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Photo Upload Field */}
                  <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">
                          Photo du détenu
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
                            id="image-upload"
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
                                  alt="Aperçu de la photo du détenu"
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
                        <div className="text-xs text-muted-foreground">
                          Cliquez sur la zone pour télécharger une photo du
                          détenu.
                        </div>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Lieu de naissance
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Goma" maxLength={20} {...field} />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentNames"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Nom des parents
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jean et Marie Mukamba"
                            maxLength={100}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originNeighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Quartier d&apos;origine
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Himbi"
                            maxLength={25}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          État civil
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner l'état civil" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Célibataire">
                              Célibataire
                            </SelectItem>
                            <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                            <SelectItem value="Divorcé(e)">
                              Divorcé(e)
                            </SelectItem>
                            <SelectItem value="Veuf(ve)">Veuf(ve)</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfChildren"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Nombre d&apos;enfants
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spouseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Nom du conjoint(e)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Marie Mukamba"
                            maxLength={100}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Religion
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Catholique"
                            maxLength={25}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Études faites
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Licence en Administration Publique"
                            maxLength={30}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Emploi</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Commerçant"
                            maxLength={25}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="residence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Résidence
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Goma - Himbi"
                            maxLength={25}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">
                          Téléphone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+243 970 123 456"
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Detention Information Section */}
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 px-4">
                    Informations d&apos;arrestation
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <FormField
                    control={form.control}
                    name="crimeReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Motif du crime
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Vol à main armée"
                            maxLength={200}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arrestLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Lieu d&apos;arrestation
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Goma Centre"
                            maxLength={100}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arrestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Date d&apos;arrestation
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
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="arrestedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Arrêté par
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Police Nationale"
                            maxLength={100}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="arrivalDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Date d&apos;arrivée
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
                                  <span>Sélectionner date d&apos;arrivée</span>
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
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Localisation
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bloc A"
                            maxLength={50}
                            {...field}
                          />
                        </FormControl>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Status Management Section */}
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 px-4">
                    Gestion du statut
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
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
                            <SelectItem value="in_custody">
                              En détention
                            </SelectItem>
                            <SelectItem value="released">Libéré</SelectItem>
                            <SelectItem value="transferred">
                              Transféré
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="max-h-[0.5rem]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Show release fields when status is "released" */}
                  {form.watch("status") === "released" && (
                    <>
                      <FormField
                        control={form.control}
                        name="releaseDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              Date de libération
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <div className="max-h-[0.5rem]">
                              <FormMessage className="text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="releaseReason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              Motif de libération
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Acquittement, libération conditionnelle..."
                                maxLength={500}
                                {...field}
                              />
                            </FormControl>
                            <div className="max-h-[0.5rem]">
                              <FormMessage className="text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Show transfer destination when status is "transferred" */}
                  {form.watch("status") === "transferred" && (
                    <FormField
                      control={form.control}
                      name="transferDestination"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-gray-700">
                            Destination de transfert
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Prison centrale de Goma, Tribunal de..."
                              maxLength={255}
                              {...field}
                            />
                          </FormControl>
                          <div className="max-h-[0.5rem]">
                            <FormMessage className="text-xs" />
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
                  disabled={updateDetainee.isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateDetainee.isPending || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Téléchargement en cours...
                    </>
                  ) : updateDetainee.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Modification en cours...
                    </>
                  ) : (
                    "Modifier le détenu"
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
