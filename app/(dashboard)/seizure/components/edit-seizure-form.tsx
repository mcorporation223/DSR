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

// Define Seizure type based on what we get from the table
export interface Seizure {
  id: string;
  itemName: string;
  type: string;
  seizureLocation: string | null;
  chassisNumber: string | null;
  plateNumber: string | null;
  ownerName: string | null;
  ownerResidence: string | null;
  seizureDate: Date;
  status: string | null;
  releaseDate: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Form validation schema matching the backend update schema
const editSeizureFormSchema = z.object({
  itemName: z.string().min(1, "Le nom/description de l'objet est requis"),
  type: z.enum(["Voiture", "Moto"], {
    message: "Sélectionner le type",
  }),
  seizureLocation: z.string().optional(),
  chassisNumber: z.string().optional(),
  plateNumber: z.string().optional(),
  ownerName: z.string().optional(),
  ownerResidence: z.string().optional(),
  seizureDate: z.date({
    message: "La date de saisie est requise",
  }),
  status: z.enum(["in_custody", "released"], {
    message: "Sélectionner le statut",
  }),
  releaseDate: z.date().optional().nullable(),
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
  // TRPC mutation for updating seizure
  const updateSeizure = trpc.seizures.update.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Saisie modifiée avec succès");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la modification de la saisie"
      );
    },
  });

  const form = useForm<EditSeizureFormValues>({
    resolver: zodResolver(editSeizureFormSchema),
    defaultValues: {
      itemName: "",
      type: "Voiture",
      seizureLocation: "",
      chassisNumber: "",
      plateNumber: "",
      ownerName: "",
      ownerResidence: "",
      seizureDate: new Date(),
      status: "in_custody",
      releaseDate: null,
    },
  });

  // Reset and populate form when seizure changes
  useEffect(() => {
    if (seizure && isOpen) {
      form.reset({
        itemName: seizure.itemName || "",
        type: (seizure.type as "Voiture" | "Moto") || "Voiture",
        seizureLocation: seizure.seizureLocation || "",
        chassisNumber: seizure.chassisNumber || "",
        plateNumber: seizure.plateNumber || "",
        ownerName: seizure.ownerName || "",
        ownerResidence: seizure.ownerResidence || "",
        seizureDate: seizure.seizureDate || new Date(),
        status: (seizure.status as "in_custody" | "released") || "in_custody",
        releaseDate: seizure.releaseDate || null,
      });
    }
  }, [seizure, isOpen, form]);

  const handleSubmit = (data: EditSeizureFormValues) => {
    if (!seizure) return;

    const formData = {
      id: seizure.id,
      ...data,
      seizureDate: data.seizureDate.toISOString(),
      releaseDate: data.releaseDate ? data.releaseDate.toISOString() : null,
    };

    updateSeizure.mutate(formData);
  };

  const handleClose = () => {
    form.reset();
    onClose();
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Nom/Description
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Toyota Corolla ou Honda CB125"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Type de véhicule
                        </FormLabel>
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
                            <SelectItem value="Voiture">Voiture</SelectItem>
                            <SelectItem value="Moto">Moto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Numéro de plaque
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="NK 1234 ABC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chassisNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Numéro de chassis
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="JH4DC4460SS123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Owner Information Section */}
              <div className="space-y-4">
                <div className="border-t border-gray-200">
                  <h3 className="p-4 font-semibold text-gray-900">
                    Informations du propriétaire
                  </h3>
                </div>

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
                        <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Seizure Information Section */}
              <div className="space-y-4">
                <div className="border-t border-gray-200">
                  <h3 className="p-4 font-semibold text-gray-900">
                    Informations de saisie
                  </h3>
                </div>

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
                        <FormMessage />
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
                            <SelectItem value="in_custody">En garde</SelectItem>
                            <SelectItem value="released">Restitué</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
                          <FormMessage />
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
                  disabled={updateSeizure.isPending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={updateSeizure.isPending}>
                  {updateSeizure.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Modifier la saisie
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
