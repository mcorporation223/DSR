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
import { Plus, Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, forwardRef, useImperativeHandle } from "react";
import { trpc } from "@/components/trpc-provider";
import { toastNotification } from "@/components/toast-notification";

// Form validation schema
const userFormSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Veuillez entrer une adresse email valide"),
    password: z.string().min(1, "Le mot de passe est requis"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
    role: z.enum(["admin", "user"], {
      message: "Veuillez sélectionner un rôle valide",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useImperativeHandle(ref, () => ({
      openDialog: () => setIsDialogOpen(true),
    }));

    const form = useForm<UserFormValues>({
      resolver: zodResolver(userFormSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
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
        // Remove confirmPassword from the data sent to the server
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...userData } = data;
        await createUserMutation.mutateAsync(userData);
      } catch {
        // Error is handled by the mutation
      }
    };

    const handleDialogClose = (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
        form.reset();
        setShowPassword(false);
        setShowConfirmPassword(false);
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

                {/* Security Information Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200"></div>
                  <div className="px-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Informations de sécurité
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Mot de passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="password (temporaire)"
                                {...field}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Confirmer le mot de passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="confirmer le mot de passe"
                                {...field}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="px-4 pb-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-xs text-blue-700">
                        <strong>Mot de passe temporaire:</strong>
                      </p>
                      <ul className="text-xs text-blue-600 mt-1 list-disc list-inside">
                        <li>
                          Peut être aussi simple qu&apos;un seul caractère
                        </li>
                        <li>
                          L&apos;utilisateur devra le changer lors de sa
                          première connexion
                        </li>
                        <li>
                          Recommandé: utiliser &quot;password&quot; ou
                          &quot;123456&quot; temporairement
                        </li>
                      </ul>
                    </div>
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
