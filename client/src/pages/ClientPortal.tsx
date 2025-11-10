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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950">
      {/* Sophisticated background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: `url(${clientBackground})` }}
      />
      
      <header className="border-b border-emerald-500/20 sticky top-0 backdrop-blur-xl bg-slate-800/90 z-10 shadow-xl shadow-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600/30 via-emerald-700/20 to-amber-600/30 flex items-center justify-center ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-900/50">
              <Shield className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">SecureDoc</h1>
              <p className="text-xs text-slate-400 font-mono" data-testid="text-user-phone">
                {user.phoneNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={onLogout}
              data-testid="button-logout"
              className="text-foreground hover:text-emerald-400 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-0">
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent" data-testid="text-page-title">
              My Documents
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl">
              View and download your financial documents securely
            </p>
            {!loading && documents.length > 0 && (
              <div className="flex items-center gap-2 text-base text-emerald-400 pt-2">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">{documents.length} {documents.length === 1 ? 'document' : 'documents'} available</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-amber-600/20 flex items-center justify-center mb-6 animate-pulse ring-4 ring-emerald-500/20">
                <Shield className="h-10 w-10 text-emerald-400" />
              </div>
              <p className="text-lg text-slate-300 font-medium">Loading your documents...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
            <div className="py-20">
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
