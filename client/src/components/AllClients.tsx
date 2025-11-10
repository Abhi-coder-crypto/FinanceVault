import { useState, useEffect } from "react";
import { User, Phone, FileText, AlertTriangle, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getAllClients, cleanupInvalidClient, type ClientWithCount } from "@/lib/api";
import { isValidPhoneNumber } from "libphonenumber-js";

interface AllClientsProps {
  onClientClick?: (phoneNumber: string) => void;
}

export default function AllClients({ onClientClick }: AllClientsProps) {
  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const clientsData = await getAllClients();
      setClients(clientsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load clients";
      toast({
        title: "Access Denied",
        description: errorMessage.includes("403") || errorMessage.includes("Access denied") 
          ? "You don't have permission to view client data"
          : "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPhoneValid = (phoneNumber: string): boolean => {
    try {
      return isValidPhoneNumber(phoneNumber);
    } catch {
      return false;
    }
  };

  const handleDeleteInvalid = async (e: React.MouseEvent, phoneNumber: string) => {
    e.stopPropagation(); // Prevent card click
    
    if (window.confirm(`Delete all data for invalid phone number "${phoneNumber}"? This will remove all associated documents.`)) {
      try {
        const result = await cleanupInvalidClient(phoneNumber);
        toast({
          title: "Cleanup successful",
          description: `Deleted ${result.deletedDocuments} documents for "${phoneNumber}"`,
        });
        await loadData(); // Refresh the list
      } catch (error) {
        toast({
          title: "Cleanup failed",
          description: error instanceof Error ? error.message : "Failed to cleanup invalid data",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    const name = (client.name || "").toLowerCase();
    const phone = client.phoneNumber.toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
        <p className="text-muted-foreground">
          Clients will appear here once they register on your platform
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center justify-end">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-clients"
          />
        </div>
      </div>

      {/* Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const isInvalid = !isPhoneValid(client.phoneNumber);
            
            return (
              <Card 
                key={client._id} 
                className={`hover-elevate cursor-pointer transition-all ${isInvalid ? 'border-destructive/50' : ''}`}
                onClick={() => onClientClick?.(client.phoneNumber)}
                data-testid={`card-client-${client.phoneNumber}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${isInvalid ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                      {isInvalid ? (
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg truncate" data-testid={`text-client-name-${client.phoneNumber}`}>
                          {client.name || "Unnamed Client"}
                        </h3>
                        {isInvalid && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => handleDeleteInvalid(e, client.phoneNumber)}
                            data-testid={`button-delete-invalid-${client.phoneNumber}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground font-mono" data-testid={`text-client-phone-${client.phoneNumber}`}>
                          {client.phoneNumber}
                        </p>
                      </div>
                      {isInvalid && (
                        <Badge variant="destructive" className="mt-2 text-xs">
                          Invalid Phone Number
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {client.documentCount} {client.documentCount === 1 ? "document" : "documents"}
                    </span>
                    {client.documentCount > 0 && (
                      <Badge variant="secondary" className="ml-auto" data-testid={`badge-doc-count-${client.phoneNumber}`}>
                        {client.documentCount}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
