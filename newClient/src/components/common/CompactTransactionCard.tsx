
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Transaction, TransactionType } from "@/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { Calendar, ArrowUpRight, ArrowDownLeft, User, FileText, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface CompactTransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

const typeConfig = {
  [TransactionType.INCOME]: {
    icon: <ArrowUpRight className="h-4 w-4 text-green-500" />,
    color: "border-l-green-500",
  },
  [TransactionType.EXPENSE]: {
    icon: <ArrowDownLeft className="h-4 w-4 text-red-500" />,
    color: "border-l-red-500",
  },
  [TransactionType.DEBT_GIVEN]: {
    icon: <User className="h-4 w-4 text-orange-500" />,
    color: "border-l-orange-500",
  },
  [TransactionType.DEBT_BOUGHT]: {
    icon: <User className="h-4 w-4 text-yellow-500" />,
    color: "border-l-yellow-500",
  },
  [TransactionType.INCOME_TAX]: {
    icon: <ArrowDownLeft className="h-4 w-4 text-purple-500" />,
    color: "border-l-purple-500",
  },
};

export const CompactTransactionCard = ({ transaction, onEdit, onDelete }: CompactTransactionCardProps) => {
  const config = typeConfig[transaction.type as TransactionType] || {
    icon: <FileText className="h-4 w-4 text-gray-500" />,
    color: "border-l-gray-500",
  };

  return (
    <div className={`group relative bg-card p-4 rounded-lg border-l-4 transition-shadow hover:shadow-md ${config.color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-grow">
          <div className="flex-shrink-0">{config.icon}</div>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-md leading-tight truncate">{transaction.name || "Unnamed"}</h4>
              <Badge variant="outline" className="text-xs font-normal whitespace-nowrap">{transaction.category.name}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(transaction.event_date).toLocaleDateString()}</span>
              </div>
              {transaction.counterparty && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">{transaction.counterparty}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 pl-4">
          <p className="font-mono font-bold text-lg">{formatCurrency(Number(transaction.amount))}</p>
          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(transaction)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onDelete(transaction.id)} className="text-red-600 focus:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {transaction.note && (
        <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">{transaction.note}</p>
      )}
    </div>
  );
};
