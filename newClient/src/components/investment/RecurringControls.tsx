
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pause, Play, Calendar, X } from "lucide-react";
import { Investment } from "@/types/investment";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecurringControlsProps {
  investment: Investment;
  onPause: (investmentId: string) => void;
  onResume: (investmentId: string) => void;
  onSkipMonth: (investmentId: string, month: string) => void;
  onRemoveSkip: (investmentId: string, month: string) => void;
  isLoading?: boolean;
}

export const RecurringControls = ({
  investment,
  onPause,
  onResume,
  onSkipMonth,
  onRemoveSkip,
  isLoading
}: RecurringControlsProps) => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const isMobile = useIsMobile();

  if (!investment.is_recurring) return null;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Generate next 12 months for skip selection
  const availableMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, currentMonth + i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return {
      key: monthKey,
      label: monthLabel,
      disabled: investment.skipped_months?.includes(monthKey) || false
    };
  });

  const handleSkipMonth = () => {
    if (!selectedMonth) {
      toast({
        title: "Error",
        description: "Please select a month to skip",
        variant: "destructive",
      });
      return;
    }

    onSkipMonth(investment.id, selectedMonth);
    setSelectedMonth("");
    setShowSkipDialog(false);
  };

  const handleRemoveSkip = (month: string) => {
    onRemoveSkip(investment.id, month);
  };

  const formatSkippedMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'items-stretch' : 'flex-wrap'}`}>
        {investment.is_paused ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResume(investment.id)}
            disabled={isLoading}
            className={`text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950 ${isMobile ? 'w-full' : ''}`}
          >
            <Play className="h-3 w-3 mr-1" />
            Resume
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPause(investment.id)}
            disabled={isLoading}
            className={`text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950 ${isMobile ? 'w-full' : ''}`}
          >
            <Pause className="h-3 w-3 mr-1" />
            Pause
          </Button>
        )}

        <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className={`text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950 ${isMobile ? 'w-full' : ''}`}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Skip Month
            </Button>
          </DialogTrigger>
          <DialogContent className={isMobile ? 'w-[95vw] max-w-[95vw]' : ''}>
            <DialogHeader>
              <DialogTitle>Skip a Month</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Month to Skip</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a month" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem 
                        key={month.key} 
                        value={month.key}
                        disabled={month.disabled}
                      >
                        {month.label}
                        {month.disabled && " (Already skipped)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'justify-end'}`}>
                <Button variant="outline" onClick={() => setShowSkipDialog(false)} className={isMobile ? 'w-full' : ''}>
                  Cancel
                </Button>
                <Button onClick={handleSkipMonth} disabled={!selectedMonth} className={isMobile ? 'w-full' : ''}>
                  Skip Month
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Indicators */}
      {investment.is_paused && (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
          Paused since {investment.paused_since ? new Date(investment.paused_since).toLocaleDateString() : 'Unknown'}
        </Badge>
      )}

      {/* Skipped Months */}
      {investment.skipped_months && investment.skipped_months.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Skipped Months:</div>
          <div className="flex flex-wrap gap-1">
            {investment.skipped_months.map((month) => (
              <Badge
                key={month}
                variant="secondary"
                className="bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 text-xs"
                onClick={() => handleRemoveSkip(month)}
              >
                {formatSkippedMonth(month)}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Click on a month to remove it from skipped list</p>
        </div>
      )}
    </div>
  );
};
