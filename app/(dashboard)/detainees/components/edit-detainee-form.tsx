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
import { TimePicker } from "@/components/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Loader2 } from "lucide-react";
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
import { useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";
import type { Detainee } from "./detainee-table";
import { Textarea } from "@/components/ui/textarea";

// Form validation schema matching the database schema
const editDetaineeFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  sex: z.enum(["Male", "Female"], {
    message: "Veuillez sélectionner le sexe",
  }),
  placeOfBirth: z.string().min(2, "Le lieu de naissance est requis"),
  dateOfBirth: z.date({
    message: "La date de naissance est requise",
  }),
  parentNames: z.string().optional(),
  originNeighborhood: z.string().optional(),
  education: z.string().optional(),
  employment: z.string().optional(),
  maritalStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed"])
    .optional(),
  maritalDetails: z.string().optional(),
  religion: z.string().optional(),
  residence: z.string().min(2, "La résidence est requise"),
  phoneNumber: z.string().optional(),
  crimeReason: z.string().min(2, "Le motif du crime est requis"),
  arrestDate: z.date({
    message: "La date d'arrestation est requise",
  }),
  arrestLocation: z.string().min(2, "Le lieu d'arrestation est requis"),
  arrestedBy: z.string().optional(),
  arrestTime: z.string().optional(),
  arrivalDate: z.date().optional(),
  arrivalTime: z.string().optional(),
  cellNumber: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["in_custody", "released", "transferred"]).optional(),
  releaseDate: z.date().optional(),
  releaseReason: z.string().optional(),
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
  // TRPC mutation for updating detainee
  const updateDetainee = trpc.detainees.update.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Détenu modifié avec succès");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la modification du détenu"
      );
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
      parentNames: "",
      originNeighborhood: "",
      education: "",
      employment: "",
      maritalStatus: undefined,
      maritalDetails: "",
      religion: "",
      residence: "",
      phoneNumber: "",
      crimeReason: "",
      arrestDate: undefined,
      arrestLocation: "",
      arrestedBy: "",
      arrestTime: "",
      arrivalDate: undefined,
      arrivalTime: "",
      cellNumber: "",
      location: "",
      status: undefined,
      releaseDate: undefined,
      releaseReason: "",
    },
  });

  // Helper function to convert timestamp to time string (HH:mm)
  const timestampToTimeString = (timestamp: string | null): string => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return format(date, "HH:mm");
  };

  // Reset and populate form when detainee changes
  useEffect(() => {
    if (detainee && isOpen) {
      form.reset({
        firstName: detainee.firstName || "",
        lastName: detainee.lastName || "",
        sex: detainee.sex as "Male" | "Female",
        placeOfBirth: detainee.placeOfBirth || "",
        dateOfBirth: detainee.dateOfBirth
          ? new Date(detainee.dateOfBirth)
          : undefined,
        parentNames: detainee.parentNames || "",
        originNeighborhood: detainee.originNeighborhood || "",
        education: detainee.education || "",
        employment: detainee.employment || "",
        maritalStatus: detainee.maritalStatus as
          | "Single"
          | "Married"
          | "Divorced"
          | "Widowed"
          | undefined,
        maritalDetails: detainee.maritalDetails || "",
        religion: detainee.religion || "",
        residence: detainee.residence || "",
        phoneNumber: detainee.phoneNumber || "",
        crimeReason: detainee.crimeReason || "",
        arrestDate: detainee.arrestDate
          ? new Date(detainee.arrestDate)
          : undefined,
        arrestLocation: detainee.arrestLocation || "",
        arrestedBy: detainee.arrestedBy || "",
        arrestTime: timestampToTimeString(detainee.arrestTime as string),
        arrivalDate: detainee.arrivalDate
          ? new Date(detainee.arrivalDate as string)
          : undefined,
        arrivalTime: timestampToTimeString(detainee.arrivalTime as string),
        cellNumber: detainee.cellNumber || "",
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
      });
    }
  }, [detainee, isOpen, form]);

  const handleSubmit = (data: EditDetaineeFormValues) => {
    if (!detainee) return;

    updateDetainee.mutate({
      id: detainee.id,
      ...data,
    });
  };

  const handleClose = () => {
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
                          <Input placeholder="Pierre" {...field} />
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
                        <FormLabel className="text-gray-700">Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Mukamba" {...field} />
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
                          <PopoverContent className="w-auto p-0" align="start">
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
                    name="parentNames"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Nom des parents
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jean et Marie Mukamba"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="Himbi" {...field} />
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
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner l'état civil" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Single">Célibataire</SelectItem>
                            <SelectItem value="Married">Marié(e)</SelectItem>
                            <SelectItem value="Divorced">Divorcé(e)</SelectItem>
                            <SelectItem value="Widowed">Veuf(ve)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maritalDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Détails état civil
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre d'enfants, conjoint..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="Catholique" {...field} />
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
                          Études faites
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
                    name="employment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Emploi</FormLabel>
                        <FormControl>
                          <Input placeholder="Commerçant" {...field} />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="Goma - Himbi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
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
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">
                          Motif du crime
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Vol à main armée" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arrestLocation"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">
                          Lieu d&apos;arrestation
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Goma Centre" {...field} />
                        </FormControl>
                        <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="arrestTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Heure d&apos;arrestation
                        </FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Sélectionner l'heure d'arrestation"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="arrestedBy"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">
                          Arrêté par
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Police Nationale" {...field} />
                        </FormControl>
                        <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="arrivalTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Heure d&apos;arrivée
                        </FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Sélectionner l'heure d'arrivée"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cellNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Numéro de cellule
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="C-12" {...field} />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="Bloc A" {...field} />
                        </FormControl>
                        <FormMessage />
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
                            <SelectItem value="in_custody">
                              En détention
                            </SelectItem>
                            <SelectItem value="released">Libéré</SelectItem>
                            <SelectItem value="transferred">
                              Transféré
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Show release fields if status is released */}
                  {form.watch("status") === "released" && (
                    <>
                      <FormField
                        control={form.control}
                        name="releaseDate"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
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
                                      <span>
                                        Sélectionner date de libération
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
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  captionLayout="dropdown"
                                  disabled={(date) => date > new Date()}
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
                        name="releaseReason"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-gray-700">
                              Motif de libération
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Fin de peine, acquittement..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
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
                <Button type="submit" disabled={updateDetainee.isPending}>
                  {updateDetainee.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Modifier le détenu
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
