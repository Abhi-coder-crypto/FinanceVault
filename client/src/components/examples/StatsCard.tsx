import { Users, FileText, Upload } from 'lucide-react';
import StatsCard from '../StatsCard';

export default function StatsCardExample() {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard 
        title="Total Clients" 
        value="1,247" 
        icon={Users} 
        description="+12% from last month"
      />
      <StatsCard 
        title="Documents" 
        value="8,492" 
        icon={FileText} 
        description="Across all clients"
      />
      <StatsCard 
        title="This Month" 
        value="156" 
        icon={Upload} 
        description="New uploads"
      />
    </div>
  );
}
