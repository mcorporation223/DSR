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
  FormDescription,
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
import { Plus, Upload, ChevronDown } from "lucide-react";
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
import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
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

// Form validation schema
const employeeFormSchema = z.object({
  firstName: z.string().min(2, "Min 2 caractères").max(20, "Max 20 caractères"),
  lastName: z.string().min(2, "Min 2 caractères").max(20, "Max 20 caractères"),
  sex: z.enum(["M", "F"], {
    message: "Sélectionner le sexe",
  }),
  placeOfBirth: z.string().min(2, "Requis").max(20, "Max 20 caractères"),
  dateOfBirth: z
    .date({
      message: "Date requise",
    })
    .max(new Date("2005-12-31"), "Date trop récente")
    .min(new Date("1940-01-01"), "Date trop ancienne"),
  education: z.string().min(2, "Requis").max(30, "Max 30 caractères"),
  maritalStatus: z.enum(["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"], {
    message: "Sélectionner l'état civil",
  }),
  function: z.string().min(2, "Requis").max(25, "Max 25 caractères"),
  deploymentLocation: z.string().min(2, "Requis").max(30, "Max 30 caractères"),
  residence: z.string().min(2, "Requis").max(25, "Max 25 caractères"),
  phone: z
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
    ),
  email: z
    .string()
    .email("Email invalide")
    .max(30, "Max 30 caractères")
    .optional()
    .or(z.literal("")),
  photoUrl: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  onSuccess?: () => void;
  employee?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    sex: string;
    placeOfBirth: string | null;
    dateOfBirth: string | null;
    education: string | null;
    maritalStatus: string | null;
    function: string | null;
    deploymentLocation: string | null;
    residence: string | null;
    phone: string | null;
    email: string | null;
    photoUrl: string | null;
    updatedAt: Date;
  };
  mode?: "create" | "edit";
  children?: React.ReactNode;
}

interface EmployeeFormRef {
  openDialog: () => void;
}

export const EmployeeForm = forwardRef<EmployeeFormRef, EmployeeFormProps>(
  ({ onSuccess, employee, mode = "create", children }, ref) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Track uploaded files for cleanup
    const [newlyUploadedFile, setNewlyUploadedFile] = useState<string | null>(
      null
    );
    const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(
      null
    );

    useImperativeHandle(ref, () => ({
      openDialog: () => setIsDialogOpen(true),
    }));

    const form = useForm<EmployeeFormValues>({
      resolver: zodResolver(employeeFormSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        sex: undefined,
        placeOfBirth: "",
        dateOfBirth: undefined,
        education: "",
        maritalStatus: undefined,
        function: "",
        deploymentLocation: "",
        residence: "",
        phone: "",
        email: "",
        photoUrl: "",
      },
    });

    useEffect(() => {
      if (employee && mode === "edit") {
        // Set image preview for existing employee photo
        if (employee.photoUrl) {
          const imageUrl = getFileUrl(employee.photoUrl);
          // Track original photo URL for cleanup when replacing
          setOriginalPhotoUrl(employee.photoUrl);

          // Test if the image can be loaded
          const img = document.createElement("img");
          img.onload = () => setImagePreview(imageUrl);
          img.onerror = () => {
            console.warn("Failed to load employee photo:", imageUrl);
            setImagePreview(null);
          };
          img.src = imageUrl;
        } else {
          setImagePreview(null);
          setOriginalPhotoUrl(null);
        }

        // Reset newly uploaded file tracking when loading an employee
        setNewlyUploadedFile(null);

        form.reset({
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          sex: employee.sex as "M" | "F" | undefined,
          placeOfBirth: employee.placeOfBirth || "",
          dateOfBirth: employee.dateOfBirth
            ? new Date(employee.dateOfBirth)
            : undefined,
          education: employee.education || "",
          maritalStatus: employee.maritalStatus as
            | "Célibataire"
            | "Marié(e)"
            | "Divorcé(e)"
            | "Veuf(ve)"
            | undefined,
          function: employee.function || "",
          deploymentLocation: employee.deploymentLocation || "",
          residence: employee.residence || "",
          phone: employee.phone || "",
          email: employee.email || "",
          photoUrl: employee.photoUrl || "",
        });
      } else if (mode === "create") {
        // Reset everything for create mode
        setImagePreview(null);
        setOriginalPhotoUrl(null);
        setNewlyUploadedFile(null);

        form.reset({
          firstName: "",
          lastName: "",
          sex: undefined,
          placeOfBirth: "",
          dateOfBirth: undefined,
          education: "",
          maritalStatus: undefined,
          function: "",
          deploymentLocation: "",
          residence: "",
          phone: "",
          email: "",
          photoUrl: "",
        });
      }
    }, [employee, mode, form]);

    const createEmployeeMutation = trpc.employees.create.useMutation({
      onSuccess: () => {
        toastNotification.success("Succès", "Employé ajouté avec succès!");
        form.reset();
        setImagePreview(null);
        setNewlyUploadedFile(null); // Clear tracking on success
        setIsDialogOpen(false);
        onSuccess?.();
      },
      onError: async (error) => {
        toastNotification.error(
          "Erreur",
          `Une erreur est survenue: ${error.message}`
        );

        // Delete newly uploaded file if employee creation fails
        if (newlyUploadedFile) {
          await deleteFile(newlyUploadedFile);
          setNewlyUploadedFile(null);
        }
      },
    });

    const updateEmployeeMutation = trpc.employees.update.useMutation({
      onSuccess: () => {
        toastNotification.success("Succès", "Employé modifié avec succès!");
        setNewlyUploadedFile(null); // Clear tracking on success
        setOriginalPhotoUrl(form.getValues("photoUrl") || null); // Update original to current
        setIsDialogOpen(false);
        onSuccess?.();
      },
      onError: async (error) => {
        toastNotification.error(
          "Erreur",
          `Une erreur est survenue: ${error.message}`
        );

        // Delete newly uploaded file if employee update fails
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

    const handleDialogClose = async (open: boolean) => {
      // If closing the dialog and there's a newly uploaded file that wasn't saved
      if (!open && newlyUploadedFile) {
        // In create mode, always delete the uploaded file
        // In edit mode, delete if it's different from the original
        if (
          mode === "create" ||
          (mode === "edit" && newlyUploadedFile !== originalPhotoUrl)
        ) {
          await deleteFile(newlyUploadedFile);
          setNewlyUploadedFile(null);

          // Restore original photo in edit mode
          if (mode === "edit" && originalPhotoUrl) {
            form.setValue("photoUrl", originalPhotoUrl);
          }
        }
      }

      setIsDialogOpen(open);
    };

    const handleSubmit = async (data: EmployeeFormValues) => {
      // Prevent submission while file is uploading
      if (isUploading) {
        toastNotification.error(
          "Upload en cours",
          "Veuillez attendre que le téléchargement de la photo soit terminé"
        );
        return;
      }

      try {
        // Normalize phone number and email for consistent DB storage
        const normalizedData = {
          ...data,
          phone: data.phone.replace(/\s/g, ""),
          email: data.email ? data.email.toLowerCase().trim() : null,
        };

        if (mode === "edit" && employee?.id) {
          await updateEmployeeMutation.mutateAsync({
            id: employee.id,
            ...normalizedData,
          });
        } else {
          await createEmployeeMutation.mutateAsync(normalizedData);
        }
      } catch {
        // Error is handled by the mutation
      }
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
        const uploadResult = await uploadFile(file, "employee");

        if (uploadResult.success && uploadResult.filePath) {
          // Delete old file when replacing (edit mode only)
          if (
            mode === "edit" &&
            originalPhotoUrl &&
            originalPhotoUrl !== uploadResult.filePath
          ) {
            await deleteFile(originalPhotoUrl);
          }

          // Delete previously uploaded file if user uploads again before submitting
          if (
            newlyUploadedFile &&
            newlyUploadedFile !== uploadResult.filePath
          ) {
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

    return (
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        {mode === "create" && (
          <DialogTrigger asChild>
            {children || (
              <Button className="">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter Employé
              </Button>
            )}
          </DialogTrigger>
        )}
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-4">
            <DialogTitle>
              {mode === "edit"
                ? "Modifier l'employé"
                : "Ajouter un nouvel employé"}
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
                  <div className="border-t border-gray-200"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Prénom
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jean"
                              maxLength={20}
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
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Nom de famille
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bemba Tshimanga"
                              maxLength={20}
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
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Sexe</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner le sexe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Homme</SelectItem>
                              <SelectItem value="F">Femme</SelectItem>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                captionLayout="dropdown"
                                startMonth={new Date("1940-01-01")}
                                endMonth={new Date("2005-12-31")}
                                disabled={(date) =>
                                  date > new Date("2005-12-31") ||
                                  date < new Date("1940-01-01")
                                }
                                initialFocus
                                defaultMonth={new Date("1985-01-01")}
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
                      name="placeOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Lieu de naissance
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Goma"
                              maxLength={80}
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
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            État civil
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                            Photo de l&apos;employé
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
                                    alt="Aperçu de la photo de l'employé"
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
                          <FormDescription>
                            Cliquez sur la zone pour télécharger une photo de
                            l&apos;employé.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <FormField
                      control={form.control}
                      name="function"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Fonction / Rôle
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Chef de Service"
                              maxLength={25}
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
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Études faites / Formation
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Licence en Administration Publique"
                              maxLength={100}
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
                      name="deploymentLocation"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-gray-700">
                            Lieu de déploiement
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nord-Kivu - Goma"
                              maxLength={30}
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

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="j.mbemba@dsr.gov.cd"
                              maxLength={30}
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
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
                            <FormMessage className="text-xs " />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="residence"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-gray-700">
                            Résidence
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Goma - Himbi"
                              maxLength={80}
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

                <DialogFooter className="gap-2 px-4 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createEmployeeMutation.isPending ||
                      updateEmployeeMutation.isPending ||
                      isUploading
                    }
                  >
                    {isUploading ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Téléchargement en cours...
                      </>
                    ) : createEmployeeMutation.isPending ||
                      updateEmployeeMutation.isPending ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        {mode === "edit"
                          ? "Modification en cours..."
                          : "Ajout en cours..."}
                      </>
                    ) : mode === "edit" ? (
                      "Modifier l'employé"
                    ) : (
                      "Ajouter l'employé"
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
);

EmployeeForm.displayName = "EmployeeForm";

// Export the form values type for use in other components
export type { EmployeeFormValues, EmployeeFormRef };
