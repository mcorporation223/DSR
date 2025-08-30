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
  Settings,
  LogOut,
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

export function Sidebar() {
  const pathname = usePathname();

  const getLinkClassName = (path: string) => {
    const isActive = pathname === path;
    return `px-4 py-2 rounded-lg flex items-center gap-3 ${
      isActive
        ? "bg-primary text-white font-medium text-sm"
        : "text-black hover:bg-primary hover:text-white font-medium text-sm"
    }`;
  };

  return (
    <div className="w-64 bg-white">
      <div className="flex h-14 items-center gap-2 px-8 border-b">
        <span className="font-bold text-primary">DSR</span>
      </div>

      <div className="p-4 mt-2 flex flex-col justify-between h-[calc(100vh-70px)]">
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className={getLinkClassName("/dashboard")}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <Link
                href="/employees"
                className={getLinkClassName("/employees")}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Employees</span>
              </Link>
              <Link href="/reports" className={getLinkClassName("/reports")}>
                <FileBarChart className="w-4 h-4" />
                Reports
              </Link>
              <Link
                href="/statements"
                className={getLinkClassName("/statements")}
              >
                <FileText className="w-4 h-4" />
                Statements
              </Link>
              <Link
                href="/detainees"
                className={getLinkClassName("/detainees")}
              >
                <UserX className="w-4 h-4" />
                Detainees
              </Link>
              <Link
                href="/incidents"
                className={getLinkClassName("/incidents")}
              >
                <AlertTriangle className="w-4 h-4" />
                Incidents
              </Link>
              <Link href="/saisie" className={getLinkClassName("/saisie")}>
                <Gavel className="w-4 h-4" />
                Saisie
              </Link>
              <Link href="/settings" className={getLinkClassName("/settings")}>
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </nav>
          </div>
        </div>
        <div className="border-2 border-dashed rounded-md p-2 flex justify-between">
          <Link
            href="/logout"
            className="flex justify-center items-center gap-3 text-black hover:bg-primary hover:text-white font-medium text-sm rounded-lg px-4 py-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Link>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full cursor-pointer hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="@username" />
                    <AvatarFallback className="bg-gray-200">JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">
                      john@example.com
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
