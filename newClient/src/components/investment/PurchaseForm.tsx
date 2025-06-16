
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Purchase } from "@/types/investment";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const purchaseSchema = z.object({
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  price_per_unit: z.number().min(0.01, "Price must be greater than 0"),
  fees: z.number().min(0, "Fees cannot be negative").optional(),
  date: z.string().min(1, "Date is required"),
});

interface PurchaseFormProps {
  onSubmit: (purchase: Omit<Purchase, 'total_amount'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PurchaseForm = ({ onSubmit, onCancel, isLoading }: PurchaseFormProps) => {
  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      quantity: 0,
      price_per_unit: 0,
      fees: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (data: z.infer<typeof purchaseSchema>) => {
    onSubmit({
      quantity: data.quantity,
      price_per_unit: data.price_per_unit,
      fees: data.fees || 0,
      date: data.date,
    });
  };

  const watchedQuantity = form.watch("quantity");
  const watchedPrice = form.watch("price_per_unit");
  const watchedFees = form.watch("fees") || 0;
  const totalAmount = (watchedQuantity || 0) * (watchedPrice || 0) + watchedFees;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Unit</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fees (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {totalAmount > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              Total Amount: ₹{totalAmount.toFixed(2)}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Purchase"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
