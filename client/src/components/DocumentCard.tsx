import { FileText, Download, Trash2, Eye, Calendar, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

  const getFileExtension = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase();
    return ext || 'FILE';
  };

  const fileExtension = getFileExtension(fileName);

  return (
    <Card className="hover-elevate transition-all duration-200 group" data-testid={`card-document-${fileName}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start gap-2 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-semibold text-base leading-tight truncate flex-1" data-testid={`text-filename-${fileName}`}>
                    {fileName}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs break-words">{fileName}</p>
                </TooltipContent>
              </Tooltip>
              <Badge variant="secondary" className="text-xs font-semibold">
                {fileExtension}
              </Badge>
            </div>
            {isAdmin && clientPhoneNumber && (
              <p className="text-xs text-muted-foreground font-mono" data-testid={`text-client-${clientPhoneNumber}`}>
                <span className="font-medium">Client:</span> {clientPhoneNumber}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate" data-testid={`text-date-${fileName}`}>{formatDate(uploadDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <HardDrive className="h-4 w-4 flex-shrink-0" />
            <span data-testid={`text-size-${fileName}`}>{formatFileSize(fileSize)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t flex gap-2 flex-wrap">
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
