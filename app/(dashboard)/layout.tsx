"use client";

import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMobileMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      <div className="flex-1 flex flex-col lg:ml-0">
        <Header onMobileMenuClick={handleMobileMenuClick} />

        <ScrollArea className="mx-auto w-full lg:h-[calc(100vh-56px)] overflow-hidden">
          <div className="lg:px-8">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Layout;
