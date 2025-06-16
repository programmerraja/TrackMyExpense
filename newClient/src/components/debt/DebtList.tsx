
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, MoreHorizontal, ChevronRight } from "lucide-react";
import { Transaction, TransactionType } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GroupedDebt {
  name: string;
  lent: number;
  borrowed: number;
  net: number;
  transactions: Transaction[];
}

interface DebtListProps {
  groupedData: GroupedDebt[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

const getDebtTypeLabel = (type: string) => {
    if (type === TransactionType.DEBT_GIVEN) return { label: "Lent", className: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200" };
    if (type === TransactionType.DEBT_BOUGHT) return { label: "Borrowed", className: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200" };
    return { label: "Debt", className: "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200" };
};

export const DebtList = ({ groupedData, isLoading, onEdit, onDelete }: DebtListProps) => {
  const [openCounterparty, setOpenCounterparty] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead className="text-right">Lent</TableHead>
              <TableHead className="text-right">Borrowed</TableHead>
              <TableHead className="text-right">Net Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-border">
                <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (groupedData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No debt entries match your filters. Try adjusting your search.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="w-12"></TableHead>
            <TableHead>Counterparty</TableHead>
            <TableHead className="text-right">Lent</TableHead>
            <TableHead className="text-right">Borrowed</TableHead>
            <TableHead className="text-right">Net Position</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedData.map((group) => (
            <Collapsible key={group.name} asChild open={openCounterparty === group.name} onOpenChange={() => setOpenCounterparty(openCounterparty === group.name ? null : group.name)}>
              <>
                <TableRow className="font-medium bg-card hover:bg-muted/50 border-border">
                  <TableCell>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0 data-[state=open]:rotate-90 transition-transform">
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </TableCell>
                  <TableCell className="text-foreground">{group.name}</TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">{formatCurrency(group.lent)}</TableCell>
                  <TableCell className="text-right text-blue-600 dark:text-blue-400">{formatCurrency(group.borrowed)}</TableCell>
                  <TableCell className="text-right font-semibold text-foreground">{formatCurrency(group.net)}</TableCell>
                </TableRow>
                <CollapsibleContent asChild>
                  <tr className="bg-muted/50 border-border">
                    <td colSpan={5} className="p-0 border-b border-border">
                      <div className="p-4">
                        <h4 className="font-semibold mb-2 text-sm text-foreground">Transactions</h4>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border">
                              <TableHead>Type</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Note</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="w-[50px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.transactions.map((transaction) => {
                                const debtType = getDebtTypeLabel(transaction.type);
                                return (
                                <TableRow key={transaction.id} className="bg-card border-border">
                                    <TableCell>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${debtType.className}`}>
                                        {debtType.label}
                                    </span>
                                    </TableCell>
                                    <TableCell className="text-foreground">{format(new Date(transaction.event_date), "MMM d, yyyy")}</TableCell>
                                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{transaction.note || 'N/A'}</TableCell>
                                    <TableCell className="text-right font-medium text-foreground">{formatCurrency(transaction.amount)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-popover border-border">
                                            <DropdownMenuItem onClick={() => onEdit(transaction)} className="text-popover-foreground hover:bg-accent">
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-red-600 dark:text-red-400 hover:bg-accent">
                                                Delete
                                            </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </td>
                  </tr>
                </CollapsibleContent>
              </>
            </Collapsible>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
