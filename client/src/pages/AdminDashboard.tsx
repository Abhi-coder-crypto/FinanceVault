import { useState, useEffect } from "react";
import { Users, FileText, Upload, LogOut, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import SearchBar from "@/components/SearchBar";
import DocumentCard from "@/components/DocumentCard";
import UploadDocumentForm from "@/components/UploadDocumentForm";
import EmptyState from "@/components/EmptyState";
import ThemeToggle from "@/components/ThemeToggle";
import AdminSettingsForm from "@/components/AdminSettingsForm";
import AllClients from "@/components/AllClients";
import BulkUploadForm from "@/components/BulkUploadForm";
import { useToast } from "@/hooks/use-toast";
import adminBackground from "@assets/stock_images/professional_finance_dee7ec85.jpg";
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
import { getDocuments, uploadDocument, deleteDocument, downloadDocument, previewDocument, updateAdminProfile, getAllClients, type ClientWithCount } from "@/lib/api";
import type { User, Document } from "@shared/schema";

const menuItems = [
  { title: "Dashboard", icon: Home, id: "dashboard" },
  { title: "Upload Document", icon: Upload, id: "upload" },
  { title: "All Clients", icon: Users, id: "clients" },
  { title: "Settings", icon: Settings, id: "settings" },
];

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(user);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, clientsData] = await Promise.all([
        getDocuments(),
        getAllClients()
      ]);
      setDocuments(docs);
      setClients(clientsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.clientPhoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async (phoneNumber: string, file: File) => {
    try {
      await uploadDocument(phoneNumber, file);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      await loadData();
      setActiveView("dashboard");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (id: string) => {
    downloadDocument(id);
  };

  const handlePreview = (id: string) => {
    previewDocument(id);
  };

  const handleUpdateProfile = async (data: { name?: string; phoneNumber?: string; password?: string }) => {
    try {
      const updatedUser = await updateAdminProfile(data);
      setCurrentUser(updatedUser);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      throw error;
    }
  };

  const handleClientClick = (phoneNumber: string) => {
    setSelectedPhoneNumber(phoneNumber);
    setActiveView("upload");
  };

  const handleMenuClick = (viewId: string) => {
    if (viewId === "upload") {
      setSelectedPhoneNumber(undefined);
    }
    setActiveView(viewId);
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full relative">
        {/* Professional finance background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-[0.03]"
          style={{ backgroundImage: `url(${adminBackground})` }}
        />
        <Sidebar className="relative z-10">
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
                        onClick={() => handleMenuClick(item.id)}
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
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden relative z-10">
          <header className="border-b p-4 flex items-center justify-between backdrop-blur-sm bg-background/95">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6 bg-background/80 backdrop-blur-sm">
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
                    value={clients.length}
                    icon={Users}
                    description="Registered clients"
                  />
                  <StatsCard
                    title="Documents"
                    value={documents.length}
                    icon={FileText}
                    description="Total documents"
                  />
                  <StatsCard
                    title="This Month"
                    value={documents.filter(d => {
                      const uploadDate = new Date(d.uploadDate);
                      const now = new Date();
                      return uploadDate.getMonth() === now.getMonth() && 
                             uploadDate.getFullYear() === now.getFullYear();
                    }).length}
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

                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading documents...</p>
                    </div>
                  ) : filteredDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredDocuments.map((doc) => (
                        <DocumentCard
                          key={doc._id}
                          fileName={doc.fileName}
                          clientPhoneNumber={doc.clientPhoneNumber}
                          uploadDate={doc.uploadDate}
                          fileSize={doc.fileSize}
                          onDownload={() => handleDownload(doc._id)}
                          onDelete={() => handleDelete(doc._id)}
                          onPreview={() => handlePreview(doc._id)}
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
                  <h1 className="text-3xl font-bold" data-testid="text-page-title">Upload Documents</h1>
                  <p className="text-muted-foreground mt-1">
                    Upload documents for clients - single or bulk upload
                  </p>
                </div>
                
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Single Upload</h2>
                    <UploadDocumentForm onUpload={handleUpload} initialPhoneNumber={selectedPhoneNumber} />
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Bulk Upload</h2>
                    <BulkUploadForm onComplete={loadData} />
                  </div>
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
                <AllClients onClientClick={handleClientClick} />
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
                <AdminSettingsForm user={currentUser} onUpdate={handleUpdateProfile} />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
