import EmptyState from '../EmptyState';

export default function EmptyStateExample() {
  return (
    <div className="p-8">
      <EmptyState 
        message="No documents found" 
        description="Upload your first document to get started" 
      />
    </div>
  );
}
