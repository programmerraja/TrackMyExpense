
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { Calendar, FileText, User } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  title: string;
  emptyMessage: string;
  isLoading?: boolean;
}

export const TransactionList = ({ 
  transactions, 
  title, 
  emptyMessage, 
  isLoading 
}: TransactionListProps) => {
  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="secondary">{transactions.length} entries</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="border-b border-gray-100 last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {transaction.name || 'Unnamed Transaction'}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {transaction.category.name}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(transaction.event_date).toLocaleDateString()}
                    </div>
                    
                    {transaction.counterparty && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {transaction.counterparty}
                      </div>
                    )}
                  </div>
                  
                  {transaction.note && (
                    <p className="text-sm text-gray-500 mt-1">{transaction.note}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    {formatCurrency(Number(transaction.amount))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(transaction.created_at || '').toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
