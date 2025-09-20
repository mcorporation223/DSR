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
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, forwardRef, useImperativeHandle } from "react";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";

// Form validation schema
const userFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  role: z.enum(["admin", "user"], {
    message: "Veuillez sélectionner un rôle valide",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSuccess?: () => void;
}

interface UserFormRef {
  openDialog: () => void;
}

export const UserForm = forwardRef<UserFormRef, UserFormProps>(
  ({ onSuccess }, ref) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      openDialog: () => setIsDialogOpen(true),
    }));

    const form = useForm<UserFormValues>({
      resolver: zodResolver(userFormSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        role: "user",
      },
    });

    const createUserMutation = trpc.users.create.useMutation({
      onSuccess: () => {
        toastNotification.success("Succès", "Utilisateur créé avec succès!");
        form.reset();
        setIsDialogOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        toastNotification.error(
          "Erreur",
          `Une erreur est survenue: ${error.message}`
        );
      },
    });

    const handleSubmit = async (data: UserFormValues) => {
      try {
        await createUserMutation.mutateAsync(data);
      } catch {
        // Error is handled by the mutation
      }
    };

    const handleDialogClose = (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
        form.reset();
      }
    };

    return (
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogTrigger asChild>
          <Button className="">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Utilisateur
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-4">
            <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
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
                          <FormLabel className="text-gray-700">
                            Prénom
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Jean-Baptiste" {...field} />
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
                          <FormLabel className="text-gray-700">
                            Nom de famille
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Mbemba Tshimanga" {...field} />
                          </FormControl>
                          <FormMessage />
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
                          <FormMessage />
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
                            defaultValue={field.value}
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
                    onClick={() => handleDialogClose(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      "Créer l'utilisateur"
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
);

UserForm.displayName = "UserForm";

// Export the form values type for use in other components
export type { UserFormValues, UserFormRef };
