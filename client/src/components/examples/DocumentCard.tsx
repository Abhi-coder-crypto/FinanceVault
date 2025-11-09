import DocumentCard from '../DocumentCard';

export default function DocumentCardExample() {
  return (
    <div className="p-8 space-y-4 max-w-2xl">
      <DocumentCard
        fileName="Tax_Return_2023.pdf"
        clientPhoneNumber="+1 (555) 123-4567"
        uploadDate="2024-01-15T10:30:00Z"
        fileSize={2456789}
        onDownload={() => console.log('Download clicked')}
        onDelete={() => console.log('Delete clicked')}
        onPreview={() => console.log('Preview clicked')}
        isAdmin={true}
      />
      <DocumentCard
        fileName="Investment_Statement_Q4.pdf"
        uploadDate="2024-02-20T14:45:00Z"
        fileSize={1234567}
        onDownload={() => console.log('Download clicked')}
        onPreview={() => console.log('Preview clicked')}
        isAdmin={false}
      />
    </div>
  );
}
