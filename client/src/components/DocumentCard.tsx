import { FileText, Download, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DocumentCardProps {
  fileName: string;
  clientPhoneNumber?: string;
  uploadDate: string;
  fileSize: number;
  onDownload: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
  isAdmin?: boolean;
}

export default function DocumentCard({
  fileName,
  clientPhoneNumber,
  uploadDate,
  fileSize,
  onDownload,
  onDelete,
  onPreview,
  isAdmin = false,
}: DocumentCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover-elevate" data-testid={`card-document-${fileName}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg truncate" data-testid={`text-filename-${fileName}`}>
              {fileName}
            </h3>
            {isAdmin && clientPhoneNumber && (
              <p className="text-sm text-muted-foreground font-mono mt-1" data-testid={`text-client-${clientPhoneNumber}`}>
                Client: {clientPhoneNumber}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span data-testid={`text-date-${fileName}`}>{formatDate(uploadDate)}</span>
              <span>•</span>
              <span data-testid={`text-size-${fileName}`}>{formatFileSize(fileSize)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
        {onPreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            data-testid={`button-preview-${fileName}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          onClick={onDownload}
          data-testid={`button-download-${fileName}`}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {isAdmin && onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            data-testid={`button-delete-${fileName}`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
