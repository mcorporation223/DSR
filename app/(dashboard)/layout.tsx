import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

const layout = ({ children }: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <ScrollArea className="mx-auto w-full h-[calc(100vh-56px)] overflow-hidden">
          <div className="px-8">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default layout