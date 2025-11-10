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
    <Card className="hover-elevate transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-2 border-emerald-900/20 hover:border-emerald-600/30 shadow-xl shadow-black/20" data-testid={`card-document-${fileName}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-4 relative">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-600/30 via-emerald-700/20 to-amber-600/30 flex items-center justify-center flex-shrink-0 ring-2 ring-emerald-500/30 group-hover:ring-emerald-400/50 group-hover:shadow-lg group-hover:shadow-emerald-900/50 transition-all duration-300">
            <FileText className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start gap-2 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-bold text-lg leading-tight truncate flex-1 text-slate-100" data-testid={`text-filename-${fileName}`}>
                    {fileName}
                  </h3>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-emerald-900/30">
                  <p className="max-w-xs break-words text-slate-200">{fileName}</p>
                </TooltipContent>
              </Tooltip>
              <Badge variant="secondary" className="text-xs font-bold bg-gradient-to-r from-emerald-600/80 to-teal-600/80 text-white border-0">
                {fileExtension}
              </Badge>
            </div>
            {isAdmin && clientPhoneNumber && (
              <p className="text-xs text-slate-400 font-mono" data-testid={`text-client-${clientPhoneNumber}`}>
                <span className="font-semibold text-emerald-400">Client:</span> {clientPhoneNumber}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-3 relative">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 p-2 rounded-lg">
            <Calendar className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <span className="truncate font-medium" data-testid={`text-date-${fileName}`}>{formatDate(uploadDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 p-2 rounded-lg">
            <HardDrive className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <span className="font-medium" data-testid={`text-size-${fileName}`}>{formatFileSize(fileSize)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-emerald-900/20 flex gap-2 flex-wrap relative">
        {onPreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            data-testid={`button-preview-${fileName}`}
            className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-950/50 hover:text-emerald-300 hover:border-emerald-600/50"
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
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-900/50 border-0"
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
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-900/50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
