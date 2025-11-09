import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface PdfPreviewModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  fileName?: string;
  onDownload?: () => void;
}

export default function PdfPreviewModal({ 
  open, 
  onClose, 
  documentId, 
  fileName,
  onDownload 
}: PdfPreviewModalProps) {
  if (!documentId) return null;

  const previewUrl = `/api/documents/${documentId}/preview`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="truncate" data-testid="text-preview-filename">
              {fileName || "Document Preview"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {onDownload && (
                <Button
                  size="sm"
                  onClick={onDownload}
                  data-testid="button-preview-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                data-testid="button-preview-close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
            data-testid="iframe-pdf-preview"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
