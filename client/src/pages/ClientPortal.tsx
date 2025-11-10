import { useState, useEffect } from "react";
import { LogOut, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentCard from "@/components/DocumentCard";
import EmptyState from "@/components/EmptyState";
import ThemeToggle from "@/components/ThemeToggle";
import PdfPreviewModal from "@/components/PdfPreviewModal";
import { useToast } from "@/hooks/use-toast";
import { getDocuments, downloadDocument } from "@/lib/api";
import type { User, Document } from "@shared/schema";
import clientBackground from "@assets/stock_images/professional_finance_15b58088.jpg";

interface ClientPortalProps {
  user: User;
  onLogout: () => void;
}

export default function ClientPortal({ user, onLogout }: ClientPortalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, [user.phoneNumber]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background relative">
      {/* Professional finance background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-5 dark:opacity-[0.03] pointer-events-none -z-10"
        style={{ backgroundImage: `url(${clientBackground})` }}
      />
      <header className="border-b sticky top-0 backdrop-blur-sm bg-background/95 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">SecureDoc</h1>
              <p className="text-xs text-muted-foreground font-mono" data-testid="text-user-phone">
                {user.phoneNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">My Documents</h2>
            <p className="text-base text-muted-foreground">
              View and download your financial documents securely
            </p>
            {!loading && documents.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{documents.length} {documents.length === 1 ? 'document' : 'documents'} available</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <p className="text-base text-muted-foreground font-medium">Loading your documents...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  fileName={doc.fileName}
                  uploadDate={doc.uploadDate}
                  fileSize={doc.fileSize}
                  onDownload={() => handleDownload(doc._id)}
                  onPreview={() => handlePreview(doc._id)}
                  isAdmin={false}
                />
              ))}
            </div>
          ) : (
            <div className="py-16">
              <EmptyState
                message="No documents yet"
                description="Your documents will appear here once uploaded by your financial advisor"
              />
            </div>
          )}
        </div>
      </main>

      <PdfPreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        documentId={previewDocumentId}
        fileName={previewFileName}
        onDownload={previewDocumentId ? () => handleDownload(previewDocumentId) : undefined}
      />
    </div>
  );
}
