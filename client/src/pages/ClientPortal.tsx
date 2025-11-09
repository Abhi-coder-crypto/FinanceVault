import { useState, useEffect } from "react";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentCard from "@/components/DocumentCard";
import EmptyState from "@/components/EmptyState";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { getDocuments, downloadDocument } from "@/lib/api";
import type { User, Document } from "@shared/schema";

interface ClientPortalProps {
  user: User;
  onLogout: () => void;
}

export default function ClientPortal({ user, onLogout }: ClientPortalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold" data-testid="text-page-title">My Documents</h2>
            <p className="text-muted-foreground mt-1">
              View and download your financial documents
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your documents...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  fileName={doc.fileName}
                  uploadDate={doc.uploadDate}
                  fileSize={doc.fileSize}
                  onDownload={() => handleDownload(doc._id)}
                  onPreview={() => handleDownload(doc._id)}
                  isAdmin={false}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No documents yet"
              description="Your documents will appear here once uploaded by your financial advisor"
            />
          )}
        </div>
      </main>
    </div>
  );
}
