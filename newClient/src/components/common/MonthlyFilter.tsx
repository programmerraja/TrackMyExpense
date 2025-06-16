
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Calendar as CalendarAllIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

interface MonthlyFilterProps {
  onDateRangeChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
  className?: string;
}

export const MonthlyFilter = ({ onDateRangeChange, className }: MonthlyFilterProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  useEffect(() => {
    onDateRangeChange(startDate, endDate);
  }, [startDate, endDate, onDateRangeChange]);

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    setStartOpen(false);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    setEndOpen(false);
  };

  const handleShowAllData = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className={`flex items-center gap-4 flex-wrap ${className}`}>
      <span className="text-sm font-medium text-foreground">Filter by date:</span>
      
      <div className="flex items-center gap-2">
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal border-border bg-card hover:bg-accent hover:text-accent-foreground",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "MMM dd, yyyy") : "Start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleStartDateChange}
              initialFocus
              className="p-3 pointer-events-auto bg-popover text-popover-foreground"
            />
          </PopoverContent>
        </Popover>

        <span className="text-sm text-muted-foreground">to</span>

        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal border-border bg-card hover:bg-accent hover:text-accent-foreground",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "MMM dd, yyyy") : "End date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={handleEndDateChange}
              initialFocus
              className="p-3 pointer-events-auto bg-popover text-popover-foreground"
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          onClick={handleShowAllData}
          className="flex items-center gap-2 border-border bg-card hover:bg-accent hover:text-accent-foreground"
        >
          <CalendarAllIcon className="h-4 w-4" />
          All Data
        </Button>
      </div>
    </div>
  );
};
