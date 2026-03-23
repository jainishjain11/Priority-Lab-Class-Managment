import { useState } from "react";
import { useGetAlerts } from "@workspace/api-client-react";
import { SmartSuggestDialog } from "@/components/smart-suggest-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MapPin, Clock, Search } from "lucide-react";
import { format } from "date-fns";

export default function Alerts() {
  const { data: alerts, isLoading } = useGetAlerts();
  const [selectedBookingForSuggest, setSelectedBookingForSuggest] = useState<{id: string, cap: number} | null>(null);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" />
          Displacement Alerts
        </h1>
        <p className="text-muted-foreground mt-2">Notifications when your lower priority classes are displaced by P1/P2 events.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-40 bg-card rounded-2xl animate-pulse" />)}
        </div>
      ) : alerts?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No alerts</h3>
          <p className="text-muted-foreground mt-1">None of your bookings have been displaced recently.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts?.map((alert) => (
            <Card key={alert.id} className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-6 flex-1 bg-amber-50/30 dark:bg-amber-950/10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-foreground">Booking Displaced</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {format(new Date(alert.displacedAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-4">
                      Your booking for <strong className="font-semibold text-primary">{alert.subject}</strong> was automatically displaced.
                    </p>
                    
                    <div className="bg-background rounded-lg border p-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground inline-flex">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {alert.originalLab}</div>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {alert.originalSlot.day}, {alert.originalSlot.startTime} - {alert.originalSlot.endTime}</div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-3 italic text-amber-700/70 dark:text-amber-400/70">
                      Reason: {alert.reason}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-card border-l flex flex-col justify-center items-center gap-3 sm:w-64">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1">Find a new slot</p>
                      <p className="text-xs text-muted-foreground mb-4">Use Smart Suggest to find equivalent alternative availability.</p>
                    </div>
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => setSelectedBookingForSuggest({ id: alert.bookingId, cap: 60 })}
                    >
                      <Search className="w-4 h-4" /> Smart Suggest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedBookingForSuggest && (
        <SmartSuggestDialog 
          open={!!selectedBookingForSuggest} 
          onOpenChange={(open) => !open && setSelectedBookingForSuggest(null)}
          bookingId={selectedBookingForSuggest.id}
          capacity={selectedBookingForSuggest.cap}
        />
      )}
    </div>
  );
}
