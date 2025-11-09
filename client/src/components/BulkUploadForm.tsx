import { useState } from "react";
import { Upload, FolderOpen, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { uploadMultipleDocuments } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface FileGroup {
  phoneNumber: string;
  files: File[];
}

interface UploadStatus {
  phoneNumber: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  totalFiles: number;
  successCount: number;
  errorCount: number;
  message?: string;
}

export default function BulkUploadForm({ onComplete }: { onComplete?: () => void }) {
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const extractFilesFromDirectory = async (entry: FileSystemDirectoryEntry): Promise<File[]> => {
    const files: File[] = [];
    const reader = entry.createReader();

    const readEntries = (): Promise<FileSystemEntry[]> => {
      return new Promise((resolve, reject) => {
        reader.readEntries(resolve, reject);
      });
    };

    // Keep reading until readEntries returns empty (handles >100 files)
    let entries: FileSystemEntry[];
    do {
      entries = await readEntries();
      
      for (const entry of entries) {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          const file = await new Promise<File>((resolve, reject) => {
            fileEntry.file(resolve, reject);
          });
          
          if (file.type === 'application/pdf') {
            files.push(file);
          }
        } else if (entry.isDirectory) {
          const subFiles = await extractFilesFromDirectory(entry as FileSystemDirectoryEntry);
          files.push(...subFiles);
        }
      }
    } while (entries.length > 0);

    return files;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = Array.from(e.dataTransfer.items);
    const groups: FileGroup[] = [];

    const skippedFolders: string[] = [];
    
    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      
      if (entry && entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const phoneNumber = dirEntry.name;
        
        // Extract all PDF files from the folder
        const files = await extractFilesFromDirectory(dirEntry);
        
        if (files.length > 0) {
          groups.push({ phoneNumber, files });
        } else {
          skippedFolders.push(phoneNumber);
        }
      } else if (entry && entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        const file = await new Promise<File>((resolve, reject) => {
          fileEntry.file(resolve, reject);
        });
        
        if (file.type === 'application/pdf') {
          toast({
            title: "Individual files not supported",
            description: "Please drag folders where the folder name is the client's phone number",
            variant: "destructive",
          });
          return;
        }
      }
    }

    if (groups.length > 0) {
      setFileGroups(prev => [...prev, ...groups]);
      const totalFiles = groups.reduce((sum, g) => sum + g.files.length, 0);
      toast({
        title: "Folders added",
        description: `Added ${groups.length} client folder(s) with ${totalFiles} PDF file(s)`,
      });
    }
    
    if (skippedFolders.length > 0) {
      toast({
        title: "Folders skipped",
        description: `${skippedFolders.length} folder(s) skipped (no PDF files found): ${skippedFolders.slice(0, 3).join(', ')}${skippedFolders.length > 3 ? '...' : ''}`,
        variant: "destructive",
      });
    }
    
    if (groups.length === 0 && skippedFolders.length === 0) {
      toast({
        title: "No valid folders",
        description: "Please drag folders containing PDF files",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFileGroup = (index: number) => {
    setFileGroups(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (fileGroups.length === 0) return;

    setIsUploading(true);
    const statuses: UploadStatus[] = fileGroups.map(group => ({
      phoneNumber: group.phoneNumber,
      status: 'pending',
      totalFiles: group.files.length,
      successCount: 0,
      errorCount: 0,
    }));
    setUploadStatuses(statuses);

    for (let i = 0; i < fileGroups.length; i++) {
      const group = fileGroups[i];
      
      setUploadStatuses(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'uploading' } : s
      ));

      try {
        const result = await uploadMultipleDocuments(group.phoneNumber, group.files);
        
        setUploadStatuses(prev => prev.map((s, idx) => 
          idx === i ? {
            ...s,
            status: result.errorCount > 0 ? 'error' : 'success',
            successCount: result.successCount,
            errorCount: result.errorCount,
            message: result.errorCount > 0 
              ? `${result.successCount} succeeded, ${result.errorCount} failed`
              : `All ${result.successCount} files uploaded successfully`
          } : s
        ));
      } catch (error) {
        setUploadStatuses(prev => prev.map((s, idx) => 
          idx === i ? {
            ...s,
            status: 'error',
            errorCount: group.files.length,
            message: error instanceof Error ? error.message : 'Upload failed'
          } : s
        ));
      }
    }

    setIsUploading(false);
    toast({
      title: "Upload complete",
      description: "All uploads have been processed",
    });
    
    if (onComplete) {
      onComplete();
    }
  };

  const totalFiles = fileGroups.reduce((sum, group) => sum + group.files.length, 0);
  const completedUploads = uploadStatuses.filter(s => s.status === 'success' || s.status === 'error').length;
  const overallProgress = uploadStatuses.length > 0 ? (completedUploads / uploadStatuses.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload - Drag & Drop Folders</CardTitle>
          <CardDescription>
            Drag folders where each folder name is the client's phone number (e.g., +1234567890).
            All PDF files inside will be uploaded for that client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <FolderOpen className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="text-lg font-semibold mb-2">
              {isDragging ? 'Drop folders here' : 'Drag folders here'}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Each folder should be named with the client's phone number
            </p>
            <p className="text-xs text-muted-foreground">
              Example: Drag folders like "+1234567890", "+9876543210", etc.
            </p>
          </div>

          {fileGroups.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                  {fileGroups.length} client folder(s) - {totalFiles} files total
                </h4>
                {!isUploading && (
                  <Button onClick={() => setFileGroups([])}>Clear All</Button>
                )}
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {fileGroups.map((group, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-mono font-medium">{group.phoneNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.files.length} PDF file(s)
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFileGroup(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {!isUploading && (
                <Button
                  onClick={handleUploadAll}
                  className="w-full"
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload All {totalFiles} Files
                </Button>
              )}
            </div>
          )}

          {isUploading && uploadStatuses.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{completedUploads} / {uploadStatuses.length} clients</span>
                </div>
                <Progress value={overallProgress} />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadStatuses.map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {status.status === 'uploading' && (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      )}
                      {status.status === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {status.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      {status.status === 'pending' && (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/25" />
                      )}
                      <div>
                        <p className="font-mono font-medium">{status.phoneNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {status.message || `${status.totalFiles} files`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
