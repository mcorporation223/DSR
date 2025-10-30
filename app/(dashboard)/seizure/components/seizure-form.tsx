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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ChevronDown, Loader2 } from "lucide-react";
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

// Form validation schema that matches the backend
const seizureFormSchema = z.object({
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
});

type SeizureFormValues = z.infer<typeof seizureFormSchema>;

interface SeizureFormProps {
  onSuccess?: () => void;
}

export function SeizureForm({ onSuccess }: SeizureFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<SeizureFormValues>({
    resolver: zodResolver(seizureFormSchema),
    defaultValues: {
      itemName: "",
      type: "Voiture" as const,
      seizureLocation: "",
      chassisNumber: "",
      plateNumber: "",
      ownerName: "",
      ownerResidence: "",
      seizureDate: new Date(),
    },
  });

  const createSeizureMutation = trpc.seizures.create.useMutation({
    onSuccess: () => {
      toastNotification.success(
        "Saisie ajoutée avec succès",
        "La nouvelle saisie a été enregistrée dans le système."
      );
      form.reset();
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur lors de l'ajout",
        error.message ||
          "Une erreur est survenue lors de l'enregistrement de la saisie."
      );
    },
  });

  const handleSubmit = (data: SeizureFormValues) => {
    const formData = {
      ...data,
      seizureDate: data.seizureDate.toISOString(),
    };
    createSeizureMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Saisie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Ajouter une nouvelle saisie</DialogTitle>
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                          defaultValue={field.value}
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
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
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
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
                  disabled={createSeizureMutation.isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createSeizureMutation.isPending}
                >
                  {createSeizureMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Ajouter la saisie
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
export type { SeizureFormValues };
