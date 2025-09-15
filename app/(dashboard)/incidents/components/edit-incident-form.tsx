"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect } from "react";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";
import type { Incident } from "./incident-table";

// Form validation schema
const victimSchema = z.object({
  nom: z.string().min(2, "Le nom de la victime est requis"),
  sexe: z.enum(["Homme", "Femme"], {
    message: "Sélectionner le sexe",
  }),
  causeDuDeces: z.string().min(2, "La cause du décès est requise"),
});

const editIncidentFormSchema = z.object({
  typeIncident: z.enum(["Assassinats", "Fusillades"], {
    message: "Sélectionner le type d'incident",
  }),
  dateIncident: z.date({
    message: "La date de l'incident est requise",
  }),
  lieuIncident: z.string().min(2, "Le lieu de l'incident est requis"),
  // Additional fields for Assassinats
  nombre: z.number().min(1, "Le nombre doit être positif").optional(),
  victimes: z.array(victimSchema).optional(),
});

type EditIncidentFormValues = z.infer<typeof editIncidentFormSchema>;

interface EditIncidentFormProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditIncidentForm({
  incident,
  isOpen,
  onClose,
  onSuccess,
}: EditIncidentFormProps) {
  // TRPC mutation for updating incident
  const updateIncident = trpc.incidents.update.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Incident modifié avec succès");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la modification de l'incident"
      );
    },
  });

  const form = useForm<EditIncidentFormValues>({
    resolver: zodResolver(editIncidentFormSchema),
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

  // Reset and populate form when incident changes
  useEffect(() => {
    if (incident && isOpen) {
      const victimes =
        incident.victims?.map((victim) => ({
          nom: victim.name || "",
          sexe: (victim.sex === "Male" ? "Homme" : "Femme") as
            | "Homme"
            | "Femme",
          causeDuDeces: victim.causeOfDeath || "",
        })) || [];

      form.reset({
        typeIncident: incident.eventType as "Assassinats" | "Fusillades",
        dateIncident: new Date(incident.incidentDate),
        lieuIncident: incident.location || "",
        nombre: incident.numberOfVictims || undefined,
        victimes: victimes,
      });
    }
  }, [incident, isOpen, form]);

  const handleSubmit = (data: EditIncidentFormValues) => {
    if (!incident) return;

    // Transform data to match API expectations
    const updateData = {
      id: incident.id,
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

    updateIncident.mutate(updateData);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!incident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>
            Modifier l&apos;incident: {incident.eventType}
          </DialogTitle>
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
                          value={field.value}
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
                        <FormMessage />
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
                    name="lieuIncident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Lieu de l&apos;incident
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Goma Centre" {...field} />
                        </FormControl>
                        <FormMessage />
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
                            <FormMessage />
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
                                          value={field.value || ""}
                                          onChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormMessage />
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
                                        value={field.value}
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
                                      <FormMessage />
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
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormMessage />
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
                  onClick={handleClose}
                  disabled={updateIncident.isPending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={updateIncident.isPending}>
                  {updateIncident.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Modifier l&apos;incident
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
