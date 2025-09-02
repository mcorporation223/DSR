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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ChevronDown } from "lucide-react";
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

// Form validation schema
const victimSchema = z.object({
  nom: z.string().min(2, "Le nom de la victime est requis"),
  sexe: z.enum(["Homme", "Femme"], {
    message: "Sélectionner le sexe",
  }),
  causeDuDeces: z.string().min(2, "La cause du décès est requise"),
});

const incidentFormSchema = z.object({
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

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentFormProps {
  onSubmit?: (data: IncidentFormValues) => void;
}

export function IncidentForm({ onSubmit }: IncidentFormProps) {
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
    onSubmit?.(data);
    form.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Ajouter un nouveau incident</DialogTitle>
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
                                          {...field}
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
                                        defaultValue={field.value}
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
                                        {...field}
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
                <Button type="button" variant="outline">
                  Annuler
                </Button>
                <Button type="submit">Ajouter l&apos;incident</Button>
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
