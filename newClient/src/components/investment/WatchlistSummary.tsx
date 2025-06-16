
interface WatchlistSummaryProps {
    totalInvestments: number;
    withTargetPrice: number;
}

export const WatchlistSummary = ({ totalInvestments, withTargetPrice }: WatchlistSummaryProps) => {
    if (totalInvestments === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-600">Watchlist Items</p>
                <p className="text-2xl font-bold text-orange-900">
                    {totalInvestments}
                </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-600">With Target Price</p>
                <p className="text-2xl font-bold text-blue-900">
                    {withTargetPrice}
                </p>
            </div>
        </div>
    );
};
