"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";

// Form validation schema
const victimSchema = z.object({
  nom: z
    .string()
    .min(2, "Le nom de la victime est requis")
    .max(30, "Le nom de la victime ne peut pas dépasser 30 caractères"),
  sexe: z.enum(["Homme", "Femme"], {
    message: "Sélectionner le sexe",
  }),
  causeDuDeces: z
    .string()
    .min(2, "La cause du décès est requise")
    .max(100, "La cause du décès ne peut pas dépasser 100 caractères"),
});

const incidentFormSchema = z.object({
  typeIncident: z.enum(["Assassinats", "Fusillades"], {
    message: "Sélectionner le type d'incident",
  }),
  dateIncident: z
    .date({
      message: "La date de l'incident est requise",
    })
    .max(new Date(), "La date de l'incident ne peut pas être dans le futur")
    .min(
      new Date("2020-01-01"),
      "La date de l'incident ne peut pas être avant 2020"
    ),
  lieuIncident: z
    .string()
    .min(2, "Le lieu de l'incident est requis")
    .max(20, "Le lieu de l'incident ne peut pas dépasser 20 caractères"),
  // Additional fields for Assassinats
  nombre: z.number().min(1, "Le nombre doit être positif").optional(),
  victimes: z.array(victimSchema).optional(),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentFormProps {
  onSuccess?: () => void;
}

export function IncidentForm({ onSuccess }: IncidentFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  // TRPC mutation for creating incident
  const createIncident = trpc.incidents.create.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Incident ajouté avec succès");
      setIsOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de l'ajout de l'incident"
      );
    },
  });
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      typeIncident: undefined,
      dateIncident: undefined,
      lieuIncident: "",
      nombre: undefined,
      victimes: [],
    },
  });

  const typeIncident = form.watch("typeIncident");
  const nombre = form.watch("nombre");

  // Watch for changes in the number of victims and update the victimes array
  useEffect(() => {
    if (typeIncident === "Assassinats" && nombre && nombre > 0) {
      const currentVictimes = form.getValues("victimes") || [];
      const newVictimes = Array.from(
        { length: nombre },
        (_, index) =>
          currentVictimes[index] || {
            nom: "",
            sexe: "Homme" as const,
            causeDuDeces: "",
          }
      );
      form.setValue("victimes", newVictimes);
    }
  }, [nombre, typeIncident, form]);

  const handleSubmit = (data: IncidentFormValues) => {
    // Transform data to match API expectations
    const createData = {
      eventType: data.typeIncident,
      incidentDate: data.dateIncident.toISOString(),
      location: data.lieuIncident,
      numberOfVictims:
        data.typeIncident === "Assassinats" ? data.nombre || 0 : 0,
      victims:
        data.typeIncident === "Assassinats" && data.victimes
          ? data.victimes.map((victime) => ({
              name: victime.nom,
              sex:
                victime.sexe === "Homme"
                  ? ("Male" as const)
                  : ("Female" as const),
              causeOfDeath: victime.causeDuDeces,
            }))
          : [],
    };

    createIncident.mutate(createData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Ajouter un nouveau incident</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Incident Information Section */}
              <div className="space-y-4">
                <div className="border-t border-gray-200"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <FormField
                    control={form.control}
                    name="typeIncident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Type d&apos;incident
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
                            <SelectItem value="Assassinats">
                              Assassinats
                            </SelectItem>
                            <SelectItem value="Fusillades">
                              Fusillades
                            </SelectItem>
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
                    name="dateIncident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Date de l&apos;incident
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
                              startMonth={new Date("2020-01-01")}
                              endMonth={new Date()}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("2020-01-01")
                              }
                              initialFocus
                              defaultMonth={new Date("2024-01-01")}
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
                    name="lieuIncident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Lieu de l&apos;incident
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

                  {/* Conditional fields for Assassinats */}
                  {typeIncident === "Assassinats" && (
                    <>
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              Nombre de victimes
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    parseInt(e.target.value) || undefined
                                  )
                                }
                              />
                            </FormControl>
                            <div className="h-[24px]">
                              <FormMessage className="text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Dynamic victim sections */}
                      {nombre && nombre > 0 && (
                        <div className="md:col-span-2 space-y-4">
                          <FormLabel className="text-base font-semibold text-gray-700">
                            Détails des Victimes
                          </FormLabel>
                          {Array.from({ length: nombre }, (_, index) => (
                            <div key={index} className="border-t p-4 space-y-4">
                              <h4 className="font-medium text-sm text-gray-600">
                                Victime {index + 1}
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`victimes.${index}.nom`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700">
                                        Nom de la Victime
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Nom complet"
                                          maxLength={30}
                                          value={field.value || ""}
                                          onChange={field.onChange}
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
                                  name={`victimes.${index}.sexe`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700">
                                        Sexe
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value || ""}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner le sexe" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Homme">
                                            Homme
                                          </SelectItem>
                                          <SelectItem value="Femme">
                                            Femme
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <div className="h-[24px]">
                                        <FormMessage className="text-xs" />
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name={`victimes.${index}.causeDuDeces`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">
                                      Cause du Décès
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Ex: Balles, Arme blanche..."
                                        maxLength={100}
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="h-[24px]">
                                      <FormMessage className="text-xs" />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 px-4 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={createIncident.isPending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createIncident.isPending}>
                  {createIncident.isPending && (
                    <Spinner className="w-4 h-4 mr-2" />
                  )}
                  Ajouter l&apos;incident
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
export type { IncidentFormValues };
