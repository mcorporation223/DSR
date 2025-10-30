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
import { RichTextEditor } from "@/components/rich-text-editor";
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
import type { Report } from "./reports-table";

// Form validation schema
const editReportFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  reportDate: z.date({
    message: "La date du rapport est requise",
  }),
  location: z.string().optional(),
  content: z
    .string()
    .min(10, "Le contenu du rapport doit contenir au moins 10 caractères"),
});

type EditReportFormValues = z.infer<typeof editReportFormSchema>;

interface EditReportFormProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditReportForm({
  report,
  isOpen,
  onClose,
  onSuccess,
}: EditReportFormProps) {
  // TRPC mutation for updating report
  const updateReport = trpc.reports.update.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Rapport modifié avec succès");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        error.message || "Erreur lors de la modification du rapport"
      );
    },
  });

  const form = useForm<EditReportFormValues>({
    resolver: zodResolver(editReportFormSchema),
    defaultValues: {
      title: "",
      reportDate: undefined,
      location: "",
      content: "",
    },
  });

  // Update form when report changes
  useEffect(() => {
    if (report && isOpen) {
      form.reset({
        title: report.title,
        reportDate: new Date(report.reportDate),
        location: report.location || "",
        content: report.content || "",
      });
    }
  }, [report, isOpen, form]);

  const handleSubmit = (data: EditReportFormValues) => {
    if (!report) return;

    const updateData = {
      id: report.id,
      title: data.title,
      content: data.content,
      location: data.location,
      reportDate: data.reportDate.toISOString(),
    };

    updateReport.mutate(updateData);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Modifier le Rapport
          </DialogTitle>
          <DialogDescription className="text-gray-600"></DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 px-6"
            >
              {/* Titre du Rapport */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Titre du rapport
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rapport d'enquête - Vol de véhicule à Goma"
                        {...field}
                      />
                    </FormControl>
                    <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
                  </FormItem>
                )}
              />

              {/* Date du Rapport et Lieu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              date > new Date() || date < new Date("2000-01-01")
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Lieu du rapport
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

              {/* Contenu du Rapport */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
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
                    <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 pt-4 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={updateReport.isPending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={updateReport.isPending}>
                  {updateReport.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Modification...
                    </>
                  ) : (
                    "Modifier le rapport"
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
