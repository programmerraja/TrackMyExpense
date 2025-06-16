
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { InvestmentFormData, InvestmentType, InvestmentPurpose, Investment, RecurringFrequency, InterestRateType } from "@/types/investment";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Create a basic schema that works for all cases
const investmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  type: z.nativeEnum(InvestmentType),
  purpose: z.nativeEnum(InvestmentPurpose),
  notes: z.string().optional(),
  target_price: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.number().optional().nullable()
  ),
  
  // Recurring investment fields
  is_recurring: z.boolean().optional(),
  recurring_frequency: z.nativeEnum(RecurringFrequency).optional(),
  recurring_amount: z.number().optional(),
  interest_rate: z.number().optional(),
  interest_rate_type: z.nativeEnum(InterestRateType).optional(),
  maturity_date: z.string().optional(),
  annual_limit: z.number().optional(),
  start_date: z.string().optional(),
  
  // NPS specific fields
  equity_ratio: z.number().min(0).max(100).optional(),
  debt_ratio: z.number().min(0).max(100).optional(),
  
  // Traditional purchase fields
  quantity: z.number().optional(),
  price_per_unit: z.number().optional(),
  fees: z.number().optional(),
  purchase_date: z.string().optional(),
});

interface InvestmentFormProps {
  purpose: InvestmentPurpose;
  onSubmit: (data: InvestmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
  initialData?: Investment;
}

export const InvestmentForm = ({ purpose, onSubmit, onCancel, isLoading, isEditing = false, initialData }: InvestmentFormProps) => {
  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: "",
      symbol: "",
      type: InvestmentType.STOCK,
      purpose,
      notes: "",
      target_price: undefined,
      purchase_date: new Date().toISOString().split('T')[0],
      quantity: undefined,
      price_per_unit: undefined,
      fees: undefined,
      is_recurring: false,
      recurring_frequency: RecurringFrequency.MONTHLY,
      recurring_amount: undefined,
      interest_rate: undefined,
      interest_rate_type: InterestRateType.FIXED,
      maturity_date: undefined,
      annual_limit: undefined,
      start_date: new Date().toISOString().split('T')[0],
      equity_ratio: 50,
      debt_ratio: 50,
    },
  });

  React.useEffect(() => {
    if (isEditing && initialData) {
      form.reset({
        name: initialData.name,
        symbol: initialData.symbol,
        type: initialData.type,
        purpose: initialData.purpose,
        target_price: initialData.target_price ?? undefined,
        notes: initialData.notes || "",
        is_recurring: initialData.is_recurring || false,
        recurring_frequency: initialData.recurring_frequency || RecurringFrequency.MONTHLY,
        recurring_amount: initialData.recurring_amount || undefined,
        interest_rate: initialData.interest_rate || undefined,
        interest_rate_type: initialData.interest_rate_type || InterestRateType.FIXED,
        maturity_date: initialData.maturity_date || undefined,
        annual_limit: initialData.annual_limit || undefined,
        start_date: initialData.start_date || undefined,
        equity_ratio: initialData.equity_ratio || 50,
        debt_ratio: initialData.debt_ratio || 50,
      });
    } else {
      form.reset({
        name: "",
        symbol: "",
        type: InvestmentType.STOCK,
        purpose,
        target_price: undefined,
        notes: "",
        purchase_date: new Date().toISOString().split('T')[0],
        quantity: undefined,
        price_per_unit: undefined,
        fees: undefined,
      });
    }
  }, [isEditing, initialData, form, purpose]);

  const handleSubmit = (data: InvestmentFormData) => {
    onSubmit(data);
  };

  const currentType = form.watch("type");
  const currentPurpose = form.watch("purpose");
  const isRecurring = form.watch("is_recurring");
  
  const isGovernmentScheme = [InvestmentType.PPF, InvestmentType.EPF, InvestmentType.NPS].includes(currentType);
  const showRecurringFields = isRecurring || isGovernmentScheme;

  // Auto-set recurring for government schemes
  React.useEffect(() => {
    if (isGovernmentScheme) {
      form.setValue("is_recurring", true);
      
      // Set default values for specific schemes
      if (currentType === InvestmentType.PPF) {
        form.setValue("annual_limit", 150000);
        form.setValue("interest_rate_type", InterestRateType.FIXED);
        form.setValue("recurring_frequency", RecurringFrequency.YEARLY);
      } else if (currentType === InvestmentType.EPF) {
        form.setValue("interest_rate_type", InterestRateType.VARIABLE);
        form.setValue("recurring_frequency", RecurringFrequency.MONTHLY);
      } else if (currentType === InvestmentType.NPS) {
        form.setValue("interest_rate_type", InterestRateType.VARIABLE);
        form.setValue("recurring_frequency", RecurringFrequency.MONTHLY);
      }
    }
  }, [currentType, form, isGovernmentScheme]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PPF Account, NPS Tier-I" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PPF, EPF, NPS" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={InvestmentType.STOCK}>Stock</SelectItem>
                  <SelectItem value={InvestmentType.MUTUAL_FUND}>Mutual Fund</SelectItem>
                  <SelectItem value={InvestmentType.GOLD}>Gold</SelectItem>
                  <SelectItem value={InvestmentType.SILVER}>Silver</SelectItem>
                  <SelectItem value={InvestmentType.PPF}>PPF (Public Provident Fund)</SelectItem>
                  <SelectItem value={InvestmentType.EPF}>EPF (Employee Provident Fund)</SelectItem>
                  <SelectItem value={InvestmentType.NPS}>NPS (National Pension System)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isGovernmentScheme && (
          <FormField
            control={form.control}
            name="is_recurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Recurring Investment</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Enable for SIP or regular contributions
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        {showRecurringFields && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recurring_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={RecurringFrequency.MONTHLY}>Monthly</SelectItem>
                        <SelectItem value={RecurringFrequency.QUARTERLY}>Quarterly</SelectItem>
                        <SelectItem value={RecurringFrequency.YEARLY}>Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurring_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        placeholder="5000" 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                name="interest_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="7.5" 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interest_rate_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={InterestRateType.FIXED}>Fixed</SelectItem>
                        <SelectItem value={InterestRateType.VARIABLE}>Variable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maturity_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maturity Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {currentType === InvestmentType.PPF && (
              <FormField
                control={form.control}
                name="annual_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Limit (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        placeholder="150000" 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentType === InvestmentType.NPS && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="equity_ratio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equity Allocation (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          max="100"
                          step="1" 
                          placeholder="50" 
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                            field.onChange(value);
                            if (value !== undefined) {
                              form.setValue("debt_ratio", 100 - value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="debt_ratio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Allocation (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          max="100"
                          step="1" 
                          placeholder="50" 
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                            field.onChange(value);
                            if (value !== undefined) {
                              form.setValue("equity_ratio", 100 - value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analysis / Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add your investment analysis, research notes, or reasons for this investment..."
                  className="min-h-[80px]"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {currentPurpose === InvestmentPurpose.MONITORING && (
          <FormField
            control={form.control}
            name="target_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Price (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {currentPurpose === InvestmentPurpose.OWNED && !isEditing && !showRecurringFields && (
          <>
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
                        placeholder="0" 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading 
              ? (isEditing ? "Saving..." : "Adding...") 
              : (isEditing ? "Save Changes" : currentPurpose === InvestmentPurpose.OWNED ? "Add Investment" : "Add to Watchlist")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
