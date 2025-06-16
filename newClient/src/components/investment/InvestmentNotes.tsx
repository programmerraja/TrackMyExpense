
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InvestmentNotesProps {
  notes: string;
  maxLength?: number;
}

export const InvestmentNotes = ({ notes, maxLength = 100 }: InvestmentNotesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!notes || notes.trim().length === 0) {
    return null;
  }

  const isLongNote = notes.length > maxLength;
  const displayText = isLongNote && !isExpanded 
    ? `${notes.substring(0, maxLength)}...` 
    : notes;

  // For very long notes (more than 300 characters), use a scrollable area
  const isVeryLong = notes.length > 300;

  if (isVeryLong) {
    return (
      <div className="space-y-2">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Notes</span>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <Card className="p-3 bg-gray-50 border-l-4 border-l-blue-200">
              <ScrollArea className="h-32 w-full">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {notes}
                </p>
              </ScrollArea>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // For medium length notes, use simple expand/collapse
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Notes</span>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-l-blue-200">
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {displayText}
        </p>
        
        {isLongNote && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show more
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
