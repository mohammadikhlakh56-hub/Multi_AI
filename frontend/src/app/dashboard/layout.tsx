import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0710] text-[#F4F4F9] selection:bg-brand/30">
      <DashboardNavbar />
      
      {/* Main Content Area with top padding for fixed navbar */}
      <main className="pt-32 pb-20">
        <div className="max-w-[90rem] mx-auto px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
