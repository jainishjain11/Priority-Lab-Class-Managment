"use client";
// src/app/(dashboard)/audit/page.tsx
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";
import type { AuditLog } from "@/types";

export default function AuditPage() {
  const { data: rawLogs, isLoading } = useQuery<{ data: AuditLog[] }>({
    queryKey: ["/api/audit"],
    queryFn: () => fetch("/api/audit").then(res => res.json()),
  });

  const logs = rawLogs?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary" />
          System Audit Trail
        </h1>
        <p className="text-muted-foreground mt-2">
          Immutable chronological record of scheduling actions and priority overrides.
        </p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Actor</th>
                <th className="px-6 py-4 font-medium">Target</th>
                <th className="px-6 py-4 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading audit log...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No audit records found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap tabular-nums text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        log.actionType === "system" ? "bg-red-50 text-red-700 border border-red-200" :
                        "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium max-w-[300px] truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{log.actor}</td>
                    <td className="px-6 py-4">{log.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        log.priority === "P1" ? "bg-red-100 text-red-800" :
                        log.priority === "P2" ? "bg-amber-100 text-amber-800" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>
                        {log.priority}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
