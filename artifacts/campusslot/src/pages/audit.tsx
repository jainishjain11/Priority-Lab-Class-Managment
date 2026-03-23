import { useState } from "react";
import { useGetAuditLogs } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, ShieldAlert, Settings, Info, Activity } from "lucide-react";
import { cn } from "@/components/layout";

export default function Audit() {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<string>("all");
  
  const { data: auditData, isLoading } = useGetAuditLogs({ 
    search: search.length > 2 ? search : undefined, 
    priority: priority !== "all" ? priority : undefined 
  });

  const getIcon = (action: string) => {
    if (action.includes("Override")) return <ShieldAlert className="w-5 h-5 text-red-500" />;
    if (action.includes("Modification") || action.includes("Update")) return <Settings className="w-5 h-5 text-amber-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">System Audit Logs</h1>
        <p className="text-muted-foreground mt-2">Immutable record of all system modifications and automated priority overrides.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-l-4 border-l-primary shadow-sm bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Entries</p>
          <p className="text-2xl font-bold">{auditData?.totalEntries || "-"}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500 shadow-sm bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">P1 Overrides</p>
          <p className="text-2xl font-bold text-red-600">{auditData?.p1Overrides || "-"}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500 shadow-sm bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">System Actions</p>
          <p className="text-2xl font-bold text-blue-600">{auditData?.systemActions || "-"}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500 shadow-sm bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Manual Actions</p>
          <p className="text-2xl font-bold text-purple-600">{auditData?.manualActions || "-"}</p>
        </Card>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search logs by actor, subject..." 
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card">
              <SelectValue placeholder="Filter Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="P1">P1 (Placement)</SelectItem>
              <SelectItem value="P2">P2 (Exam)</SelectItem>
              <SelectItem value="P3">P3 (Regular)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Activity className="w-8 h-8 animate-pulse mb-3 opacity-50" />
              Loading audit trail...
            </div>
          ) : auditData?.entries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No logs found matching your filters.
            </div>
          ) : (
            auditData?.entries.map((log) => (
              <div key={log.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors flex gap-4 sm:gap-6">
                <div className="mt-1 shrink-0 bg-background border p-2 rounded-xl shadow-sm">
                  {getIcon(log.action)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-foreground text-base">{log.action}</h4>
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-md">
                      {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {log.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                    <Badge variant="outline" className={cn(
                      "font-mono text-[10px] border-0",
                      log.priority === "P1" ? "bg-red-100 text-red-800" :
                      log.priority === "P2" ? "bg-amber-100 text-amber-800" :
                      "bg-emerald-100 text-emerald-800"
                    )}>
                      {log.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Actor:</strong> {log.actor}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Subject:</strong> {log.subject}
                    </span>
                    {log.labName && (
                      <span className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Lab:</strong> {log.labName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
