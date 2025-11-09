import { useState } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { uploadMultipleDocuments } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { isValidPhoneNumber } from "libphonenumber-js";

interface BulkUploadFormProps {
  onComplete?: () => void;
  phoneNumber: string;
}

export default function BulkUploadForm({ onComplete, phoneNumber }: BulkUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error';
    successCount: number;
    errorCount: number;
    message?: string;
  }>({
    status: 'idle',
    successCount: 0,
    errorCount: 0,
  });
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
    const allPdfFiles: File[] = [];

    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      
      if (entry && entry.isDirectory) {
        // Extract all PDFs from the folder
        const dirEntry = entry as FileSystemDirectoryEntry;
        const pdfFiles = await extractFilesFromDirectory(dirEntry);
        allPdfFiles.push(...pdfFiles);
      } else if (entry && entry.isFile) {
        // Individual file dropped
        const fileEntry = entry as FileSystemFileEntry;
        const file = await new Promise<File>((resolve, reject) => {
          fileEntry.file(resolve, reject);
        });
        
        if (file.type === 'application/pdf') {
          allPdfFiles.push(file);
        }
      }
    }

    if (allPdfFiles.length === 0) {
      toast({
        title: "No PDF files found",
        description: "Please drop folders containing PDFs or PDF files directly",
        variant: "destructive",
      });
      return;
    }

    setFiles(prev => [...prev, ...allPdfFiles]);
    toast({
      title: "Files added",
      description: `Added ${allPdfFiles.length} PDF file(s)`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
      toast({
        title: "Files added",
        description: `Added ${pdfFiles.length} PDF file(s)`,
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter the client's phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number
    let isValid = false;
    try {
      isValid = isValidPhoneNumber(phoneNumber);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number with country code (e.g., +1234567890)",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select or drag PDF files to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({ status: 'uploading', successCount: 0, errorCount: 0 });

    try {
      const result = await uploadMultipleDocuments(phoneNumber, files);
      
      setUploadProgress({
        status: result.errorCount > 0 ? 'error' : 'success',
        successCount: result.successCount,
        errorCount: result.errorCount,
        message: result.errorCount > 0 
          ? `${result.successCount} succeeded, ${result.errorCount} failed`
          : `All ${result.successCount} files uploaded successfully`
      });

      toast({
        title: "Upload complete",
        description: `${result.successCount} file(s) uploaded successfully`,
      });

      // Clear form on success
      if (result.errorCount === 0) {
        setFiles([]);
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      setUploadProgress({
        status: 'error',
        successCount: 0,
        errorCount: files.length,
        message: error instanceof Error ? error.message : 'Upload failed'
      });

      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Multiple Files</CardTitle>
        <CardDescription>
          Upload multiple PDFs for the client. Drag folders or individual files.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
        >
          <FileText className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <h3 className="text-base font-semibold mb-2">
            {isDragging ? 'Drop folders or files here' : 'Drag & drop folders or PDF files'}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Accepts folders containing PDFs or individual PDF files
          </p>
          <input
            type="file"
            id="bulk-file-input"
            multiple
            accept="application/pdf"
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('bulk-file-input')?.click()}
            disabled={isUploading}
            data-testid="button-browse-files"
          >
            Browse Files
          </Button>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">
                {files.length} file(s) selected
              </h4>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles([])}
                  data-testid="button-clear-files"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  data-testid={`file-item-${index}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0"
                      onClick={() => removeFile(index)}
                      data-testid={`button-remove-file-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isUploading && uploadProgress.status === 'uploading' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">Uploading {files.length} file(s)...</span>
            </div>
            <Progress value={50} />
          </div>
        )}

        {uploadProgress.status === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600">{uploadProgress.message}</span>
          </div>
        )}

        {uploadProgress.status === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-red-600">{uploadProgress.message}</span>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0 || !phoneNumber.trim()}
          className="w-full"
          size="lg"
          data-testid="button-bulk-upload"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {files.length} File(s)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
