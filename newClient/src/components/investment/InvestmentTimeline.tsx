
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pause, SkipForward, TrendingUp } from "lucide-react";
import { InvestmentWithSummary, RecurringFrequency } from "@/types/investment";
import { formatCurrency } from "@/lib/formatters";

interface TimelineEvent {
  date: string;
  type: 'contribution' | 'skip' | 'pause' | 'resume' | 'interest_change';
  amount?: number;
  description: string;
  icon: React.ReactNode;
}

interface InvestmentTimelineProps {
  investment: InvestmentWithSummary;
}

export const InvestmentTimeline = ({ investment }: InvestmentTimelineProps) => {
  if (!investment.is_recurring) {
    return null;
  }

  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const startDate = new Date(investment.start_date || investment.created_at);
    const currentDate = new Date();
    const skippedMonths = investment.skipped_months || [];

    // Add start event
    events.push({
      date: startDate.toISOString().split('T')[0],
      type: 'contribution',
      amount: investment.recurring_amount,
      description: `Started ${investment.recurring_frequency?.toLowerCase()} contributions`,
      icon: <TrendingUp className="h-3 w-3 text-green-600" />
    });

    // Generate monthly events based on frequency
    const monthsToShow = 12; // Show last 12 months
    const frequency = investment.recurring_frequency || RecurringFrequency.MONTHLY;
    const intervalMonths = frequency === RecurringFrequency.MONTHLY ? 1 : 
                          frequency === RecurringFrequency.QUARTERLY ? 3 : 12;

    for (let i = 0; i < monthsToShow; i += intervalMonths) {
      const eventDate = new Date(currentDate);
      eventDate.setMonth(eventDate.getMonth() - i);
      const monthKey = eventDate.toISOString().slice(0, 7); // YYYY-MM

      if (skippedMonths.includes(monthKey)) {
        events.push({
          date: eventDate.toISOString().split('T')[0],
          type: 'skip',
          description: `Skipped ${frequency.toLowerCase()} contribution`,
          icon: <SkipForward className="h-3 w-3 text-orange-600" />
        });
      } else if (eventDate >= startDate) {
        events.push({
          date: eventDate.toISOString().split('T')[0],
          type: 'contribution',
          amount: investment.recurring_amount,
          description: `${frequency} contribution`,
          icon: <TrendingUp className="h-3 w-3 text-blue-600" />
        });
      }
    }

    // Add pause events
    if (investment.is_paused && investment.paused_since) {
      events.push({
        date: investment.paused_since,
        type: 'pause',
        description: 'Investment paused',
        icon: <Pause className="h-3 w-3 text-red-600" />
      });
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const events = generateTimelineEvents();

  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case 'contribution': return 'default';
      case 'skip': return 'secondary';
      case 'pause': return 'destructive';
      case 'resume': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          Investment Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {events.slice(0, 10).map((event, index) => (
            <div key={index} className="flex items-start gap-3 pb-2 border-b border-gray-100 last:border-0">
              <div className="mt-1">
                {event.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <Badge variant={getEventBadgeVariant(event.type)} className="text-xs">
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm">{event.description}</p>
                {event.amount && (
                  <p className="text-xs text-green-600 font-medium">
                    {formatCurrency(event.amount)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
