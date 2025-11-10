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
  X,
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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  const getLinkClassName = (path: string) => {
    // Special case for dashboard/home: consider both "/dashboard" and "/" as active
    const isActive =
      pathname === path || (path === "/dashboard" && pathname === "/");
    return `px-4 py-2 rounded-lg flex items-center gap-3 w-full ${
      isActive
        ? "bg-primary text-white font-medium text-sm"
        : "text-black hover:bg-primary hover:text-white font-medium text-sm"
    }`;
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          bg-white border-r transition-all duration-300 ease-in-out
          fixed inset-y-0 left-0 z-50 w-64 transform lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:block
        `}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b">
          <span className="font-bold text-primary">DSR</span>
          {/* Close button for mobile */}
          <div
            onClick={onClose}
            className="lg:hidden rounded-md hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 mt-2 flex flex-col justify-between h-[calc(100vh-70px)]">
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <nav className="space-y-2">
                <Link
                  href="/"
                  className={getLinkClassName("/dashboard")}
                  onClick={handleLinkClick}
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">Accueil</span>
                </Link>
                <Link
                  href="/employees"
                  className={getLinkClassName("/employees")}
                  onClick={handleLinkClick}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Employés</span>
                </Link>
                <Link
                  href="/users"
                  className={getLinkClassName("/users")}
                  onClick={handleLinkClick}
                >
                  <UserCog className="w-4 h-4" />
                  <span className="text-sm font-medium">Utilisateurs</span>
                </Link>
                <Link
                  href="/reports"
                  className={getLinkClassName("/reports")}
                  onClick={handleLinkClick}
                >
                  <FileBarChart className="w-4 h-4" />
                  <span className="text-sm font-medium">Rapports</span>
                </Link>
                <Link
                  href="/statements"
                  className={getLinkClassName("/statements")}
                  onClick={handleLinkClick}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Déclarations</span>
                </Link>
                <Link
                  href="/detainees"
                  className={getLinkClassName("/detainees")}
                  onClick={handleLinkClick}
                >
                  <UserX className="w-4 h-4" />
                  <span className="text-sm font-medium">Détenus</span>
                </Link>
                <Link
                  href="/incidents"
                  className={getLinkClassName("/incidents")}
                  onClick={handleLinkClick}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Incidents</span>
                </Link>
                <Link
                  href="/seizure"
                  className={getLinkClassName("/seizure")}
                  onClick={handleLinkClick}
                >
                  <Gavel className="w-4 h-4" />
                  <span className="text-sm font-medium">Saisies</span>
                </Link>
                <Link
                  href="/audit-logs"
                  className={getLinkClassName("/audit-logs")}
                  onClick={handleLinkClick}
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
          <div className="hidden border-2 border-dashed rounded-md p-2 lg:flex flex-col sm:flex-row justify-between gap-2">
            <button
              onClick={handleLogout}
              className=" cursor-pointer flex justify-center items-center gap-3 text-black hover:bg-primary hover:text-white font-medium text-sm rounded-lg px-4 py-2 w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
            <div className="flex items-center justify-center sm:justify-end gap-4">
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
                              .slice(0, 2)
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
    </>
  );
}
