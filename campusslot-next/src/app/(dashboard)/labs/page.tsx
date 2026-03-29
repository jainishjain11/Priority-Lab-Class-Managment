"use client";
// src/app/(dashboard)/labs/page.tsx
import { useQuery } from "@tanstack/react-query";
import { Server, Wrench, Edit, Cpu, Monitor } from "lucide-react";
import { useState } from "react";
import type { Lab } from "@/types";

export default function LabsPage() {
  const { data: rawLabs, refetch, isLoading } = useQuery<{ data: Lab[] }>({
    queryKey: ["/api/labs"],
    queryFn: () => fetch("/api/labs").then(res => res.json()),
  });

  const labs = rawLabs?.data ?? [];
  const [toggling, setToggling] = useState<string | null>(null);

  const toggleMaintenance = async (id: string, current: boolean) => {
    setToggling(id);
    await fetch(`/api/labs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isUnderMaintenance: !current }),
    });
    await refetch();
    setToggling(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            Lab Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage physical hardware capabilities and maintenance windows.</p>
        </div>
        <button className="h-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
          + Add New Lab
        </button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">Lab Name</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Capacity</th>
              <th className="px-6 py-4 font-medium">Specs</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Loading labs...</td></tr>
            ) : labs.map(lab => (
              <tr key={lab.id} className={lab.isUnderMaintenance ? "bg-muted/30 opacity-80" : "hover:bg-muted/10 transition-colors"}>
                <td className="px-6 py-4 font-semibold text-base">{lab.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{lab.building}, Fl {lab.floor}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full border bg-background font-medium text-xs">
                    {lab.capacity} Seats
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {lab.hasI7Processors && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                        <Cpu className="w-3.5 h-3.5" /> Core i7
                      </span>
                    )}
                    {lab.hasGraphicsCards && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                        <Monitor className="w-3.5 h-3.5" /> Dedicated GPU
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      disabled={toggling === lab.id}
                      onClick={() => toggleMaintenance(lab.id, lab.isUnderMaintenance)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                        lab.isUnderMaintenance ? 'bg-amber-500' : 'bg-input'
                      }`}
                    >
                      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                        lab.isUnderMaintenance ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                    {lab.isUnderMaintenance ? (
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Maintenance</span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600">Available</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium hover:bg-muted text-muted-foreground transition-colors">
                    <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
