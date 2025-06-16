
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, MoreHorizontal } from "lucide-react";
import { Transaction } from "@/types/transaction";
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

interface IncomeListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export const IncomeList = ({ transactions, isLoading, onEdit, onDelete }: IncomeListProps) => {
  if (isLoading) {
    return (
      <Card className="bg-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-foreground">Name</TableHead>
              <TableHead className="text-foreground">Category</TableHead>
              <TableHead className="text-foreground">Date</TableHead>
              <TableHead className="text-right text-foreground">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-border">
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-card border border-border">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No income entries match your filters. Try adjusting your search.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-foreground">Name</TableHead>
            <TableHead className="text-foreground">Category</TableHead>
            <TableHead className="text-foreground">Date</TableHead>
            <TableHead className="text-right text-foreground">Amount</TableHead>
            <TableHead className="w-[50px] text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="border-border">
              <TableCell className="font-medium text-foreground">{transaction.name}</TableCell>
              <TableCell className="text-foreground">{transaction.category.name}</TableCell>
              <TableCell className="text-foreground">{format(new Date(transaction.event_date), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-right text-foreground">{formatCurrency(transaction.amount)}</TableCell>
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
                    <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-destructive hover:bg-destructive/10">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
