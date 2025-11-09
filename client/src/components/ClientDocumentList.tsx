import { useState } from "react";
import { ChevronDown, ChevronRight, User, FileText, Download, Eye, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ClientWithCount } from "@/lib/api";
import type { Document } from "@shared/schema";

interface ClientDocumentListProps {
  clients: ClientWithCount[];
  documents: Document[];
  onDownload: (id: string) => void;
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ClientDocumentList({ 
  clients, 
  documents, 
  onDownload, 
  onPreview, 
  onDelete 
}: ClientDocumentListProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const toggleClient = (phoneNumber: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(phoneNumber)) {
      newExpanded.delete(phoneNumber);
    } else {
      newExpanded.add(phoneNumber);
    }
    setExpandedClients(newExpanded);
  };

  const getClientDocuments = (phoneNumber: string) => {
    return documents.filter(doc => doc.clientPhoneNumber === phoneNumber);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Only show clients who have documents
  const clientsWithDocs = clients.filter(c => c.documentCount > 0);

  if (clientsWithDocs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
        <p className="text-muted-foreground">Upload documents to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clientsWithDocs.map(client => {
        const isExpanded = expandedClients.has(client.phoneNumber);
        const clientDocs = getClientDocuments(client.phoneNumber);

        return (
          <Card key={client.phoneNumber} className="overflow-hidden" data-testid={`card-client-docs-${client.phoneNumber}`}>
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover-elevate"
              onClick={() => toggleClient(client.phoneNumber)}
              data-testid={`button-toggle-client-${client.phoneNumber}`}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate" data-testid={`text-client-name-${client.phoneNumber}`}>
                  {client.name || "Unregistered Client"}
                </h3>
                <p className="text-sm text-muted-foreground font-mono" data-testid={`text-client-phone-${client.phoneNumber}`}>
                  {client.phoneNumber}
                </p>
              </div>
              <Badge variant="secondary" data-testid={`badge-doc-count-${client.phoneNumber}`}>
                {client.documentCount} {client.documentCount === 1 ? 'doc' : 'docs'}
              </Badge>
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {isExpanded && (
              <div className="border-t bg-muted/30">
                <div className="p-4 space-y-2">
                  {clientDocs.map(doc => (
                    <div
                      key={doc._id}
                      className="flex items-center gap-3 p-3 bg-background rounded-md border"
                      data-testid={`row-document-${doc._id}`}
                    >
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" data-testid={`text-filename-${doc._id}`}>
                          {doc.fileName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(doc.fileSize)} • {formatDate(doc.uploadDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreview(doc._id!);
                          }}
                          data-testid={`button-preview-${doc._id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(doc._id!);
                          }}
                          data-testid={`button-download-${doc._id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(doc._id!);
                          }}
                          data-testid={`button-delete-${doc._id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
