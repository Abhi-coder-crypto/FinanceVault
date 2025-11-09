import { useState, useEffect } from "react";
import { User, Phone, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAllClients, type ClientWithCount } from "@/lib/api";

interface AllClientsProps {
  onClientClick?: (phoneNumber: string) => void;
}

export default function AllClients({ onClientClick }: AllClientsProps) {
  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => {
          return (
            <Card 
              key={client._id} 
              className="hover-elevate cursor-pointer transition-all" 
              onClick={() => onClientClick?.(client.phoneNumber)}
              data-testid={`card-client-${client.phoneNumber}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" data-testid={`text-client-name-${client.phoneNumber}`}>
                      {client.name || "Unnamed Client"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground font-mono" data-testid={`text-client-phone-${client.phoneNumber}`}>
                        {client.phoneNumber}
                      </p>
                    </div>
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
    </div>
  );
}
