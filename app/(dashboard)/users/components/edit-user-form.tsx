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
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";
import { User } from "./user-table";
import { Checkbox } from "@/components/ui/checkbox";

// Form validation schema for editing users (no password required)
const editUserFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  role: z.enum(["admin", "user"], {
    message: "Veuillez sélectionner un rôle valide",
  }),
  isActive: z.boolean(),
});

type EditUserFormValues = z.infer<typeof editUserFormSchema>;

interface EditUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

export function EditUserForm({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditUserFormProps) {
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
      isActive: true,
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        role: user.role as "admin" | "user",
        isActive: user.isActive,
      });
    }
  }, [user, form]);

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toastNotification.success("Succès", "Utilisateur modifié avec succès!");
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toastNotification.error(
        "Erreur",
        `Une erreur est survenue: ${error.message}`
      );
    },
  });

  const handleSubmit = async (data: EditUserFormValues) => {
    if (!user) return;

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        ...data,
      });
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleDialogClose = () => {
    onClose();
    form.reset();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
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
                        <FormLabel className="text-gray-700">Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean-Baptiste" {...field} />
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
                        <FormLabel className="text-gray-700">
                          Nom de famille
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Mbemba Tshimanga" {...field} />
                        </FormControl>
                        <div className="h-[24px]">
                          <FormMessage className="text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">
                          Adresse email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="j.mbemba@dsr.gov.cd"
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
                    name="role"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700">Rôle</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="admin">
                              Administrateur
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
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 md:col-span-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-700">
                            Compte actif
                          </FormLabel>
                          <p className="text-sm text-gray-500">
                            L&apos;utilisateur peut se connecter au système
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* User Information Display */}
              <div className="space-y-4">
                <div className="border-t border-gray-200"></div>
                <div className="px-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Informations du compte
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Date de création
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Dernière modification
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(user.updatedAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-xs text-amber-700">
                      <strong>Note:</strong>
                    </p>
                    <ul className="text-xs text-amber-600 mt-1 list-disc list-inside">
                      <li>
                        Pour modifier le mot de passe, utilisez la fonction
                        &quot;Changer mot de passe&quot;
                      </li>
                      <li>
                        Les modifications prendront effet immédiatement pour
                        l&apos;utilisateur
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 px-4 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Modification en cours...
                    </>
                  ) : (
                    "Enregistrer les modifications"
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
export type { EditUserFormValues };
