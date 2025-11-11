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
import { TimePicker } from "@/components/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ChevronDown } from "lucide-react";
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
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";

// Form validation schema matching the database schema
const detaineeFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(20, "Le prénom ne peut pas dépasser 20 caractères"),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(20, "Le nom ne peut pas dépasser 20 caractères"),
  sex: z.enum(["Male", "Female"], {
    message: "Veuillez sélectionner le sexe",
  }),
  placeOfBirth: z
    .string()
    .min(2, "Le lieu de naissance est requis")
    .max(20, "Le lieu de naissance ne peut pas dépasser 20 caractères"),
  dateOfBirth: z
    .date({
      message: "La date de naissance est requise",
    })
    .max(new Date(), "La date de naissance ne peut pas être dans le futur")
    .min(
      new Date("1940-01-01"),
      "La date de naissance ne peut pas être avant 1940"
    ),
  parentNames: z
    .string()
    .max(100, "Les noms des parents ne peuvent pas dépasser 100 caractères")
    .optional(),
  originNeighborhood: z
    .string()
    .max(25, "Le quartier d'origine ne peut pas dépasser 25 caractères")
    .optional(),
  education: z
    .string()
    .max(30, "L'éducation ne peut pas dépasser 30 caractères")
    .optional(),
  employment: z
    .string()
    .max(25, "La profession ne peut pas dépasser 25 caractères")
    .optional(),
  maritalStatus: z
    .enum(["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"])
    .optional(),
  maritalDetails: z
    .string()
    .max(100, "Les détails maritaux ne peuvent pas dépasser 100 caractères")
    .optional(),
  religion: z
    .string()
    .max(25, "La religion ne peut pas dépasser 25 caractères")
    .optional(),
  residence: z
    .string()
    .min(2, "La résidence est requise")
    .max(25, "La résidence ne peut pas dépasser 25 caractères"),
  phoneNumber: z
    .string()
    .regex(
      /^\+[1-9]\d{1,3}\s?[0-9\s]{6,14}$/,
      "Format invalide. Le numéro doit être au format international (+XXX suivi de 6-12 chiffres)"
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
  crimeReason: z
    .string()
    .min(2, "Le motif du crime est requis")
    .max(200, "Le motif du crime ne peut pas dépasser 200 caractères"),
  arrestDate: z.date({
    message: "La date d'arrestation est requise",
  }),
  arrestLocation: z
    .string()
    .min(2, "Le lieu d'arrestation est requis")
    .max(100, "Le lieu d'arrestation ne peut pas dépasser 100 caractères"),
  arrestedBy: z
    .string()
    .max(100, "Le nom de l'agent ne peut pas dépasser 100 caractères")
    .optional(),
  arrestTime: z.string().optional(),
  arrivalDate: z.date().optional(),
  arrivalTime: z.string().optional(),
  cellNumber: z
    .string()
    .max(20, "Le numéro de cellule ne peut pas dépasser 20 caractères")
    .optional(),
  location: z
    .string()
    .max(50, "L'emplacement ne peut pas dépasser 50 caractères")
    .optional(),
});

type DetaineeFormValues = z.infer<typeof detaineeFormSchema>;

interface DetaineeFormProps {
  onSuccess?: () => void;
}

export function DetaineeForm({ onSuccess }: DetaineeFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  // TRPC mutation for creating detainee
  const createDetainee = trpc.detainees.create.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Détenu ajouté avec succès");
      form.reset();
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de l'ajout du détenu"
      );
    },
  });

  const form = useForm<DetaineeFormValues>({
    resolver: zodResolver(detaineeFormSchema),
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
      arrestTime: "", // Time field as string
      arrivalDate: undefined, // Date field
      arrivalTime: "", // Time field as string
      cellNumber: "",
      location: "",
    },
  });

  const handleSubmit = (data: DetaineeFormValues) => {
    // Normalize phone number by stripping all spaces before submission
    const normalizedData = {
      ...data,
      phoneNumber: data.phoneNumber
        ? data.phoneNumber.replace(/\s/g, "")
        : undefined,
    };
    createDetainee.mutate(normalizedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Détenu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Ajouter un nouveau détenu</DialogTitle>
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
                        <div className="h-[24px]">
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
                        <div className="h-[24px]">
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
                        <div className="h-[24px]">
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
                        <div className="h-[24px]">
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
                          <Input placeholder="Goma" maxLength={15} {...field} />
                        </FormControl>
                        <div className="h-[24px]">
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
                            maxLength={15}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
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
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                            maxLength={50}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
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
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
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
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
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
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
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
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                          <Input
                            placeholder="+243 970 123 456 ou +250 788 123 456"
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
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
                      <FormItem className="md:col-span-2">
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                          <Input
                            placeholder="Goma Centre"
                            maxLength={20}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                          <Input
                            placeholder="Police Nationale"
                            maxLength={15}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                          <Input placeholder="C-12" maxLength={10} {...field} />
                        </FormControl>
                        <div className="h-[24px]">
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
                            maxLength={10}
                            {...field}
                          />
                        </FormControl>
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
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
                  onClick={() => setIsOpen(false)}
                  disabled={createDetainee.isPending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createDetainee.isPending}>
                  {createDetainee.isPending && (
                    <Spinner className="w-4 h-4 mr-2" />
                  )}
                  Ajouter le détenu
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
export type { DetaineeFormValues };
