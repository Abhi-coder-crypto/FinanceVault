import UploadDocumentForm from '../UploadDocumentForm';

export default function UploadDocumentFormExample() {
  return (
    <div className="p-8 max-w-2xl">
      <UploadDocumentForm 
        onUpload={(phone, file) => console.log('Upload:', phone, file.name)} 
      />
    </div>
  );
}
