import { useState } from "react";
import { Users, FileText, Upload, LogOut, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import SearchBar from "@/components/SearchBar";
import DocumentCard from "@/components/DocumentCard";
import UploadDocumentForm from "@/components/UploadDocumentForm";
import EmptyState from "@/components/EmptyState";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Shield } from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: Home, id: "dashboard" },
  { title: "Upload Document", icon: Upload, id: "upload" },
  { title: "All Clients", icon: Users, id: "clients" },
  { title: "Settings", icon: Settings, id: "settings" },
];

// todo: remove mock functionality
const mockDocuments = [
  {
    id: "1",
    fileName: "Tax_Return_2023.pdf",
    clientPhoneNumber: "+1 (555) 123-4567",
    uploadDate: "2024-01-15T10:30:00Z",
    fileSize: 2456789,
  },
  {
    id: "2",
    fileName: "Investment_Statement_Q4.pdf",
    clientPhoneNumber: "+1 (555) 234-5678",
    uploadDate: "2024-02-20T14:45:00Z",
    fileSize: 1234567,
  },
  {
    id: "3",
    fileName: "Account_Summary_2024.pdf",
    clientPhoneNumber: "+1 (555) 345-6789",
    uploadDate: "2024-03-10T09:15:00Z",
    fileSize: 987654,
  },
];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState(mockDocuments);

  const filteredDocuments = documents.filter((doc) =>
    doc.clientPhoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = (phoneNumber: string, file: File) => {
    console.log("Uploading document:", phoneNumber, file);
    // todo: remove mock functionality
    const newDoc = {
      id: String(documents.length + 1),
      fileName: file.name,
      clientPhoneNumber: phoneNumber,
      uploadDate: new Date().toISOString(),
      fileSize: file.size,
    };
    setDocuments([newDoc, ...documents]);
    setActiveView("dashboard");
  };

  const handleDelete = (id: string) => {
    console.log("Deleting document:", id);
    // todo: remove mock functionality
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">SecureDoc</h2>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.id)}
                        isActive={activeView === item.id}
                        data-testid={`button-nav-${item.id}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => console.log("Logout")}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="border-b p-4 flex items-center justify-between">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeView === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage client documents and track uploads
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCard
                    title="Total Clients"
                    value="1,247"
                    icon={Users}
                    description="+12% from last month"
                  />
                  <StatsCard
                    title="Documents"
                    value={documents.length}
                    icon={FileText}
                    description="Across all clients"
                  />
                  <StatsCard
                    title="This Month"
                    value="156"
                    icon={Upload}
                    description="New uploads"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Recent Documents</h2>
                    <div className="w-full max-w-sm">
                      <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by client phone..."
                      />
                    </div>
                  </div>

                  {filteredDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredDocuments.map((doc) => (
                        <DocumentCard
                          key={doc.id}
                          fileName={doc.fileName}
                          clientPhoneNumber={doc.clientPhoneNumber}
                          uploadDate={doc.uploadDate}
                          fileSize={doc.fileSize}
                          onDownload={() => console.log("Download:", doc.id)}
                          onDelete={() => handleDelete(doc.id)}
                          onPreview={() => console.log("Preview:", doc.id)}
                          isAdmin={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      message="No documents found"
                      description={
                        searchQuery
                          ? "Try a different phone number"
                          : "Upload documents to get started"
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {activeView === "upload" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="text-page-title">Upload Document</h1>
                  <p className="text-muted-foreground mt-1">
                    Upload a new document for a client
                  </p>
                </div>
                <div className="max-w-2xl">
                  <UploadDocumentForm onUpload={handleUpload} />
                </div>
              </div>
            )}

            {activeView === "clients" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="text-page-title">All Clients</h1>
                  <p className="text-muted-foreground mt-1">
                    View and manage all client accounts
                  </p>
                </div>
                <EmptyState
                  message="Client management"
                  description="This feature will be implemented in the next phase"
                />
              </div>
            )}

            {activeView === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="text-page-title">Settings</h1>
                  <p className="text-muted-foreground mt-1">
                    Configure your account and preferences
                  </p>
                </div>
                <EmptyState
                  message="Settings"
                  description="This feature will be implemented in the next phase"
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
