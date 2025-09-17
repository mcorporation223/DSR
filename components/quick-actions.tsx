"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  FileText,
  AlertTriangle,
  Gavel,
  PlusCircle,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "Nouveau Détenu",
    description: "Enregistrer un nouveau détenu",
    icon: UserPlus,
    href: "/detainees",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Créer Rapport",
    description: "Générer un nouveau rapport",
    icon: FileText,
    href: "/reports",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "Signaler Incident",
    description: "Déclarer un nouvel incident",
    icon: AlertTriangle,
    href: "/incidents",
    color: "bg-red-500 hover:bg-red-600",
  },
  {
    title: "Nouvelle Saisie",
    description: "Enregistrer une saisie",
    icon: Gavel,
    href: "/seizure",
    color: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    title: "Ajouter Employé",
    description: "Enregistrer un employé",
    icon: Users,
    href: "/employees",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    title: "Nouvelle Déclaration",
    description: "Créer une déclaration",
    icon: PlusCircle,
    href: "/statements",
    color: "bg-indigo-500 hover:bg-indigo-600",
  },
];

export function QuickActions() {
  return (
    <Card className="border-none hover:shadow-lg transition-all duration-300 col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Actions Rapides
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Accès rapide aux tâches les plus fréquentes
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="h-auto p-3 md:p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200 group border-border/50 w-full"
              >
                <div
                  className={`p-2 rounded-lg text-white ${action.color} group-hover:scale-110 transition-transform duration-200`}
                >
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-xs">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                    {action.description}
                  </p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
