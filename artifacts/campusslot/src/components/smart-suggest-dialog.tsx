import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGetSuggestions } from "@workspace/api-client-react";
import { Lightbulb, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

interface SmartSuggestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  capacity: number;
}

export function SmartSuggestDialog({ open, onOpenChange, bookingId, capacity }: SmartSuggestProps) {
  const suggestionsQuery = useGetSuggestions();

  useEffect(() => {
    if (open) {
      suggestionsQuery.mutate({
        data: {
          bookingId,
          capacity,
          preferredWeek: "current"
        }
      });
    }
  }, [open, bookingId, capacity]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Smart Alternatives
          </DialogTitle>
          <DialogDescription>
            We found these available slots that match your original requirements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {suggestionsQuery.isPending && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-muted rounded-xl h-24 w-full" />
              ))}
            </div>
          )}

          {suggestionsQuery.data?.map((suggestion, i) => (
            <div key={i} className="border rounded-xl p-4 hover:border-primary/50 transition-colors group bg-card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {suggestion.lab.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {suggestion.timeSlot.day}, {suggestion.timeSlot.startTime} - {suggestion.timeSlot.endTime}
                  </div>
                </div>
                <Button variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Book Slot
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{suggestion.reason}</span>
                  <span className={suggestion.score > 80 ? "text-emerald-600" : "text-amber-600"}>
                    {suggestion.score}% Match
                  </span>
                </div>
                <Progress value={suggestion.score} className="h-1.5" />
              </div>
            </div>
          ))}

          {suggestionsQuery.data?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
              <p>No immediate alternatives found.</p>
              <p className="text-sm mt-1">Try adjusting your capacity requirements.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
