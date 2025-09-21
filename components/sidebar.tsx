"use client";

import Link from "next/link";
import {
  Home,
  Users,
  FileBarChart,
  FileText,
  UserX,
  AlertTriangle,
  Gavel,
  ScrollText,
  // Settings,
  LogOut,
  UserCog,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useSession, signOut } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  const getLinkClassName = (path: string) => {
    // Special case for dashboard/home: consider both "/dashboard" and "/" as active
    const isActive =
      pathname === path || (path === "/dashboard" && pathname === "/");
    return `px-4 py-2 rounded-lg flex items-center gap-3 ${
      isActive
        ? "bg-primary text-white font-medium text-sm"
        : "text-black hover:bg-primary hover:text-white font-medium text-sm"
    }`;
  };

  return (
    <div className="bg-white">
      <div className="flex h-14 items-center gap-2 px-8 border-b">
        <span className="font-bold text-primary">DSR</span>
      </div>

      <div className="p-4 mt-2 flex flex-col justify-between h-[calc(100vh-70px)]">
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            <nav className="space-y-2">
              <Link href="/" className={getLinkClassName("/dashboard")}>
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Accueil</span>
              </Link>
              <Link
                href="/employees"
                className={getLinkClassName("/employees")}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Employés</span>
              </Link>
              <Link href="/users" className={getLinkClassName("/users")}>
                <UserCog className="w-4 h-4" />
                <span className="text-sm font-medium">Utilisateurs</span>
              </Link>
              <Link href="/reports" className={getLinkClassName("/reports")}>
                <FileBarChart className="w-4 h-4" />
                <span className="text-sm font-medium">Rapports</span>
              </Link>
              <Link
                href="/statements"
                className={getLinkClassName("/statements")}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Déclarations</span>
              </Link>
              <Link
                href="/detainees"
                className={getLinkClassName("/detainees")}
              >
                <UserX className="w-4 h-4" />
                <span className="text-sm font-medium">Détenus</span>
              </Link>
              <Link
                href="/incidents"
                className={getLinkClassName("/incidents")}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Incidents</span>
              </Link>
              <Link href="/seizure" className={getLinkClassName("/seizure")}>
                <Gavel className="w-4 h-4" />
                <span className="text-sm font-medium">Saisies</span>
              </Link>
              <Link
                href="/audit-logs"
                className={getLinkClassName("/audit-logs")}
              >
                <ScrollText className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Journaux d&apos;audit
                </span>
              </Link>
              {/* <Link href="/settings" className={getLinkClassName("/settings")}>
                <Settings className="w-4 h-4" />
                Settings
              </Link> */}
            </nav>
          </div>
        </div>
        <div className="border-2 border-dashed rounded-md p-2 flex justify-between">
          <button
            onClick={handleLogout}
            className="cursor-pointer flex justify-center items-center gap-3 text-black hover:bg-primary hover:text-white font-medium text-sm rounded-lg px-4 py-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full cursor-pointer hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src=""
                      alt={session?.user?.name || "Utilisateur"}
                    />
                    <AvatarFallback className="bg-gray-200">
                      {session?.user?.name
                        ? session.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {session?.user?.name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email || "Aucun email"}
                    </p>
                    <p className="text-xs text-blue-600 capitalize">
                      {session?.user?.role || "Aucun rôle"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                {/* <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
