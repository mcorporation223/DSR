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
import { Plus, Upload, ChevronDown, Loader2 } from "lucide-react";
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
import { uploadFile, validateImageFile, getFileUrl } from "@/lib/upload-utils";
import { toastNotification } from "@/components/toast-notification";

// Form validation schema
const employeeFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  sex: z.enum(["Male", "Female"], {
    message: "Veuillez sélectionner le sexe",
  }),
  placeOfBirth: z.string().min(2, "Le lieu de naissance est requis"),
  dateOfBirth: z.date({
    message: "La date de naissance est requise",
  }),
  education: z.string().min(2, "La formation est requise"),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"], {
    message: "Veuillez sélectionner l'état civil",
  }),
  function: z.string().min(2, "La fonction est requise"),
  deploymentLocation: z.string().min(2, "Le lieu de déploiement est requis"),
  residence: z.string().min(2, "La résidence est requise"),
  phone: z
    .string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
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
  };
  mode?: "create" | "edit";
}

interface EmployeeFormRef {
  openDialog: () => void;
}

export const EmployeeForm = forwardRef<EmployeeFormRef, EmployeeFormProps>(
  ({ onSuccess, employee, mode = "create" }, ref) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        }

        form.reset({
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          sex: employee.sex as "Male" | "Female" | undefined,
          placeOfBirth: employee.placeOfBirth || "",
          dateOfBirth: employee.dateOfBirth
            ? new Date(employee.dateOfBirth)
            : undefined,
          education: employee.education || "",
          maritalStatus: employee.maritalStatus as
            | "Single"
            | "Married"
            | "Divorced"
            | "Widowed"
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
        setIsDialogOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        toastNotification.error(
          "Erreur",
          `Une erreur est survenue: ${error.message}`
        );
      },
    });

    const updateEmployeeMutation = trpc.employees.update.useMutation({
      onSuccess: () => {
        toastNotification.success("Succès", "Employé modifié avec succès!");
        setIsDialogOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        toastNotification.error(
          "Erreur",
          `Une erreur est survenue: ${error.message}`
        );
      },
    });

    const handleSubmit = async (data: EmployeeFormValues) => {
      try {
        if (mode === "edit" && employee?.id) {
          await updateEmployeeMutation.mutateAsync({
            id: employee.id,
            ...data,
          });
        } else {
          await createEmployeeMutation.mutateAsync(data);
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {mode === "create" && (
          <DialogTrigger asChild>
            <Button className="">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Employé
            </Button>
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
                            <Input placeholder="Jean-Baptiste" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="Mbemba Tshimanga" {...field} />
                          </FormControl>
                          <FormMessage />
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
                              <SelectItem value="Male">Homme</SelectItem>
                              <SelectItem value="Female">Femme</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
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
                            <Input placeholder="Goma" {...field} />
                          </FormControl>
                          <FormMessage />
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
                              <SelectItem value="Single">
                                Célibataire
                              </SelectItem>
                              <SelectItem value="Married">Marié(e)</SelectItem>
                              <SelectItem value="Divorced">
                                Divorcé(e)
                              </SelectItem>
                              <SelectItem value="Widowed">Veuf(ve)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-1" />
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
                            <Input placeholder="Chef de Service" {...field} />
                          </FormControl>
                          <FormMessage />
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
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="Nord-Kivu - Goma" {...field} />
                          </FormControl>
                          <FormMessage />
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
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="+243 970 123 456" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="Goma - Himbi" {...field} />
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
                    onClick={() => setIsDialogOpen(false)}
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
                    {createEmployeeMutation.isPending ||
                    updateEmployeeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
