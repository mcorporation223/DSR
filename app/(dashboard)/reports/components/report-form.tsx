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
import { RichTextEditor } from "@/components/rich-text-editor";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { trpc } from "@/components/trpc-provider";
import { useState } from "react";
import { toastNotification } from "@/components/toast-notification";

// Form validation schema
const reportFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  reportDate: z.date({
    message: "La date du rapport est requise",
  }),
  location: z.string().optional(),
  content: z
    .string()
    .min(10, "Le contenu du rapport doit contenir au moins 10 caractères"),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
  onSubmit?: (data: ReportFormValues) => void;
  onSuccess?: () => void;
}

export function ReportForm({ onSubmit, onSuccess }: ReportFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      location: "",
      reportDate: undefined,
      content: "",
    },
  });

  // TRPC mutation for creating reports
  const createReportMutation = trpc.reports.create.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      form.reset();
      onSuccess?.();
      toastNotification.success(
        "Rapport créé avec succès",
        "Le nouveau rapport a été ajouté à la base de données."
      );
    },
    onError: (error) => {
      console.error("Error creating report:", error);
      toastNotification.error(
        "Erreur lors de la création",
        error.message ||
          "Une erreur s'est produite lors de la création du rapport."
      );
    },
  });

  const handleSubmit = (data: ReportFormValues) => {
    // Convert date to ISO string for the backend
    const reportData = {
      title: data.title,
      content: data.content,
      reportDate: data.reportDate.toISOString(),
    };

    createReportMutation.mutate(reportData);
    onSubmit?.(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Rapport
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Ajouter un nouveau rapport</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Report Information Section */}
              <div className="space-y-4">
                <div className="border-t border-gray-200"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">
                          Titre du rapport
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rapport d'enquête - Vol de véhicule à Goma"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reportDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Date du rapport
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Lieu du rapport
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
                    name="content"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">
                          Contenu du rapport
                        </FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Rédigez ici le contenu détaillé du rapport..."
                            className="min-h-[120px]"
                          />
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
                  onClick={() => setIsOpen(false)}
                  disabled={createReportMutation.isPending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createReportMutation.isPending}>
                  {createReportMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Ajouter le rapport"
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

// Export the form values type for use in other components
export type { ReportFormValues };
