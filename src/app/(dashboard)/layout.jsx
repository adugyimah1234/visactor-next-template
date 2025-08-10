// app/(dashboard)/layout.tsx
import { SideNav, TopNav } from "@/components/nav";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Toaster } from "sonner";
export default function DashboardLayout({ children, }) {
    return (<>
      <DashboardProvider>
    <TopNav title="3 GARRISON EDUCATION CENTRE"/>
    <div className="flex h-screen"> {/* Ensure a flex container for sidebar and main */}
      <SideNav />
        
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-8">
        {children} {/* The content from (dashboard)/page.tsx will render here */}
      </main>
      <Toaster richColors/>
    </div>
      </DashboardProvider>
  </>);
}
