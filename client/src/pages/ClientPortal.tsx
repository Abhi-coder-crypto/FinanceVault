import { useState } from "react";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentCard from "@/components/DocumentCard";
import EmptyState from "@/components/EmptyState";
import ThemeToggle from "@/components/ThemeToggle";

// todo: remove mock functionality
const mockClientDocuments = [
  {
    id: "1",
    fileName: "Tax_Return_2023.pdf",
    uploadDate: "2024-01-15T10:30:00Z",
    fileSize: 2456789,
  },
  {
    id: "2",
    fileName: "Investment_Statement_Q4.pdf",
    uploadDate: "2024-02-20T14:45:00Z",
    fileSize: 1234567,
  },
  {
    id: "3",
    fileName: "Account_Summary_2024.pdf",
    uploadDate: "2024-03-10T09:15:00Z",
    fileSize: 987654,
  },
];

interface ClientPortalProps {
  phoneNumber: string;
  onLogout: () => void;
}

export default function ClientPortal({ phoneNumber, onLogout }: ClientPortalProps) {
  const [documents] = useState(mockClientDocuments);

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
                {phoneNumber}
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

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  fileName={doc.fileName}
                  uploadDate={doc.uploadDate}
                  fileSize={doc.fileSize}
                  onDownload={() => console.log("Download:", doc.id)}
                  onPreview={() => console.log("Preview:", doc.id)}
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
