import { useGetLabs, useUpdateLab } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Server, Wrench, Edit, Cpu, Monitor } from "lucide-react";

export default function Labs() {
  const { data: labs, isLoading } = useGetLabs();
  const updateLab = useUpdateLab();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleMaintenanceToggle = (labId: string, currentStatus: boolean, name: string) => {
    updateLab.mutate(
      { labId, data: { isUnderMaintenance: !currentStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/labs"] });
          toast({
            title: "Lab Status Updated",
            description: `${name} is now ${!currentStatus ? 'under maintenance' : 'available'}.`,
          });
        }
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            Lab Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage physical hardware capabilities and maintenance windows.</p>
        </div>
        <Button>+ Add New Lab</Button>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Lab Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Specs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">Loading labs...</TableCell>
              </TableRow>
            ) : (
              labs?.map((lab) => (
                <TableRow key={lab.id} className={lab.isUnderMaintenance ? "bg-muted/30 opacity-70" : ""}>
                  <TableCell className="font-semibold text-base">{lab.name}</TableCell>
                  <TableCell>
                    {lab.building}, Fl {lab.floor}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-background">{lab.capacity} Seats</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {lab.hasI7Processors && (
                        <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                          <Cpu className="w-3 h-3" /> Core i7
                        </Badge>
                      )}
                      {lab.hasGraphicsCards && (
                        <Badge variant="secondary" className="gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                          <Monitor className="w-3 h-3" /> Dedicated GPU
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={lab.isUnderMaintenance}
                        onCheckedChange={() => handleMaintenanceToggle(lab.id, lab.isUnderMaintenance, lab.name)}
                        className="data-[state=checked]:bg-amber-500"
                      />
                      {lab.isUnderMaintenance ? (
                        <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> Maintenance
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600">Available</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
