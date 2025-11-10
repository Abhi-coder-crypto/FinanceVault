import { useState, useEffect } from "react";
import { Users, FileText, Upload, LogOut, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatsCard from "@/components/StatsCard";
import SearchBar from "@/components/SearchBar";
import DocumentCard from "@/components/DocumentCard";
import UploadDocumentForm from "@/components/UploadDocumentForm";
import EmptyState from "@/components/EmptyState";
import ThemeToggle from "@/components/ThemeToggle";
import AdminSettingsForm from "@/components/AdminSettingsForm";
import AllClients from "@/components/AllClients";
import BulkUploadForm from "@/components/BulkUploadForm";
import ClientDocumentList from "@/components/ClientDocumentList";
import PdfPreviewModal from "@/components/PdfPreviewModal";
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
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | undefined>(undefined);
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
    const doc = documents.find(d => d._id === id);
    setPreviewDocumentId(id);
    setPreviewFileName(doc?.fileName);
    setPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewModalOpen(false);
    setPreviewDocumentId(null);
    setPreviewFileName(undefined);
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
        <Sidebar className="relative z-10 border-r border-emerald-900/20">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600/30 via-emerald-700/20 to-amber-600/30 flex items-center justify-center ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-900/50">
                <Shield className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">SecureDoc</h2>
                <p className="text-xs text-slate-400">Admin Portal</p>
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
          <SidebarFooter className="p-4 border-t border-emerald-900/20">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/30"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden relative z-10">
          <header className="border-b border-emerald-900/20 p-4 flex items-center justify-between backdrop-blur-xl bg-slate-900/80 shadow-lg shadow-black/10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6 lg:p-8 bg-gradient-to-br from-slate-950/50 via-gray-900/50 to-slate-950/50 backdrop-blur-sm relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/10 via-transparent to-amber-950/5 pointer-events-none" />
            {activeView === "dashboard" && (
              <div className="space-y-8 max-w-7xl mx-auto relative">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent" data-testid="text-page-title">Dashboard</h1>
                      <p className="text-lg text-slate-300 mt-3">
                        Manage client documents and track uploads
                      </p>
                    </div>
                    <div className="text-sm text-emerald-400 font-semibold bg-slate-900/50 px-4 py-2 rounded-lg border border-emerald-900/30">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatsCard
                    title="Active Clients"
                    value={clients.filter(c => c.documentCount > 0).length}
                    icon={Users}
                    description="Clients with documents"
                  />
                  <StatsCard
                    title="Total Documents"
                    value={documents.length}
                    icon={FileText}
                    description="All uploaded files"
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

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Documents by Client</h2>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading documents...</p>
                    </div>
                  ) : (
                    <ClientDocumentList
                      clients={clients}
                      documents={documents}
                      onDownload={handleDownload}
                      onPreview={handlePreview}
                      onDelete={handleDelete}
                    />
                  )}
                </div>
              </div>
            )}

            {activeView === "upload" && (
              <div className="space-y-8 max-w-6xl mx-auto">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight" data-testid="text-page-title">Upload Documents</h1>
                  <p className="text-base text-muted-foreground">
                    Upload documents for clients - single or bulk upload
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="upload-phone">Client Phone Number</Label>
                      <Input
                        id="upload-phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={selectedPhoneNumber || ""}
                        onChange={(e) => setSelectedPhoneNumber(e.target.value)}
                        className="font-mono"
                        data-testid="input-upload-phone"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the phone number once - use it for both single and bulk uploads below
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Single File Upload</h2>
                    <UploadDocumentForm onUpload={handleUpload} phoneNumber={selectedPhoneNumber || ""} />
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Multiple Files Upload</h2>
                    <BulkUploadForm onComplete={loadData} phoneNumber={selectedPhoneNumber || ""} />
                  </div>
                </div>
              </div>
            )}

            {activeView === "clients" && (
              <div className="space-y-8 max-w-7xl mx-auto">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight" data-testid="text-page-title">All Clients</h1>
                  <p className="text-base text-muted-foreground">
                    View and manage all client accounts
                  </p>
                </div>
                <AllClients onClientClick={handleClientClick} />
              </div>
            )}

            {activeView === "settings" && (
              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight" data-testid="text-page-title">Settings</h1>
                  <p className="text-base text-muted-foreground">
                    Configure your account and preferences
                  </p>
                </div>
                <AdminSettingsForm user={currentUser} onUpdate={handleUpdateProfile} />
              </div>
            )}
          </main>
        </div>

        <PdfPreviewModal
          open={previewModalOpen}
          onClose={handleClosePreview}
          documentId={previewDocumentId}
          fileName={previewFileName}
          onDownload={previewDocumentId ? () => handleDownload(previewDocumentId) : undefined}
        />
      </div>
    </SidebarProvider>
  );
}
