"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="lg:hidden p-2 rounded-md hover:bg-gray-100"
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Open navigation menu</span>
    </Button>
  );
}
