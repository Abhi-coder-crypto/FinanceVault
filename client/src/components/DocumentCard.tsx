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
    <Card className="hover-elevate transition-all duration-300 group relative overflow-hidden shadow-lg" data-testid={`card-document-${fileName}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative space-y-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 flex items-center justify-center flex-shrink-0 ring-1 ring-emerald-500/30 group-hover:ring-emerald-400/50 transition-all duration-300">
              <FileText className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-semibold text-base leading-tight truncate text-foreground" data-testid={`text-filename-${fileName}`}>
                    {fileName}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs break-words">{fileName}</p>
                </TooltipContent>
              </Tooltip>
              {isAdmin && clientPhoneNumber && (
                <p className="text-xs text-muted-foreground font-mono mt-1" data-testid={`text-client-${clientPhoneNumber}`}>
                  {clientPhoneNumber}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-600/30 flex-shrink-0">
            {fileExtension}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-3 space-y-2 relative">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span className="font-medium" data-testid={`text-date-${fileName}`}>{formatDate(uploadDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span className="font-medium" data-testid={`text-size-${fileName}`}>{formatFileSize(fileSize)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t flex gap-2 flex-wrap relative">
        {onPreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            data-testid={`button-preview-${fileName}`}
            className="flex-1 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/50"
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
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
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
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
