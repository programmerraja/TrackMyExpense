
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvestmentPurpose } from "@/types/investment";

interface InvestmentPageHeaderProps {
    onAddInvestment: () => void;
    activeTab: InvestmentPurpose;
}

export const InvestmentPageHeader = ({ onAddInvestment, activeTab }: InvestmentPageHeaderProps) => {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Investment Tracker</h1>
            <Button onClick={onAddInvestment} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                {activeTab === InvestmentPurpose.OWNED ? "Add Investment" : "Add to Watchlist"}
            </Button>
        </div>
    );
};
