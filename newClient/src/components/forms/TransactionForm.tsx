
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionType, TransactionFormData, Transaction } from "@/types/transaction";
import { Category } from "@/types/category";
import { useState, useEffect } from "react";
import { categoryService } from "@/services/categoryService";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const transactionSchema = z.object({
  name: z.string().optional(),
  note: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category_id: z.string().min(1, "Category is required"),
  counterparty: z.string().optional(),
  event_date: z.string().optional(),
});

interface TransactionFormProps {
  type: TransactionType;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Transaction;
}

export const TransactionForm = ({ type, onSubmit, onCancel, isLoading, initialData }: TransactionFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentType, setCurrentType] = useState(type);
  const isDebtForm = type === TransactionType.DEBT_GIVEN || type === TransactionType.DEBT_BOUGHT;

  useEffect(() => {
    setCurrentType(type);
  }, [type]);

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: "",
      note: "",
      amount: 0,
      counterparty: "",
      event_date: new Date().toISOString().split('T')[0],
      category_id: "",
    },
  });

  const categoryTypeMap = {
    [TransactionType.INCOME]: 'INCOME',
    [TransactionType.EXPENSE]: 'EXPENSE',
    [TransactionType.DEBT_GIVEN]: 'DEBT',
    [TransactionType.DEBT_BOUGHT]: 'DEBT',
    [TransactionType.INCOME_TAX]: 'TAX',
  } as const;
  
  useEffect(() => {
    const fetchCategories = async () => {
      const categoryType = categoryTypeMap[type];
      if (categoryType) {
        const fetchedCategories = await categoryService.getCategories(categoryType);
        setCategories(fetchedCategories);

        if (initialData) return;

        if (isDebtForm && fetchedCategories.length > 0) {
          form.setValue("category_id", fetchedCategories[0].id);
        } else if (!isDebtForm && fetchedCategories.length === 1) {
          form.setValue("category_id", fetchedCategories[0].id);
        }
      }
    };
    fetchCategories();
  }, [type, form, initialData, isDebtForm]);
  
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        note: initialData.note || "",
        amount: initialData.amount,
        counterparty: initialData.counterparty || "",
        event_date: initialData.event_date ? new Date(initialData.event_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category_id: initialData.category_id,
      });
      setCurrentType(initialData.type as TransactionType);
    } else {
      form.reset({
        name: "",
        note: "",
        amount: 0,
        counterparty: "",
        event_date: new Date().toISOString().split('T')[0],
        category_id: "",
      });
      setCurrentType(type);
    }
  }, [initialData, form, type]);

  const handleSubmit = (data: z.infer<typeof transactionSchema>) => {
    const formData: TransactionFormData = {
      name: data.name,
      note: data.note,
      amount: data.amount,
      category_id: data.category_id,
      type: currentType,
      counterparty: data.counterparty,
      event_date: data.event_date,
    };
    
    onSubmit(formData);
  };

  const showCounterparty = isDebtForm;
  const showNameField = !isDebtForm;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {showNameField && (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Enter transaction name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>
      )}

      {isDebtForm && (
        <div className="space-y-2">
          <Label>Debt Type</Label>
          <RadioGroup 
            onValueChange={(value) => setCurrentType(value as TransactionType)} 
            value={currentType} 
            className="flex items-center gap-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={TransactionType.DEBT_GIVEN} id="debt_given" />
              <Label htmlFor="debt_given" className="cursor-pointer font-normal">Lent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={TransactionType.DEBT_BOUGHT} id="debt_bought" />
              <Label htmlFor="debt_bought" className="cursor-pointer font-normal">Borrowed</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...form.register("amount", { valueAsNumber: true })}
          placeholder="0.00"
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
        )}
      </div>

      {!isDebtForm && (
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.watch("category_id")} onValueChange={(value) => form.setValue("category_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name.charAt(0) + category.name.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
           {form.formState.errors.category_id && (
            <p className="text-sm text-red-500">{form.formState.errors.category_id.message}</p>
          )}
        </div>
      )}

      {showCounterparty && (
        <div className="space-y-2">
          <Label htmlFor="counterparty">
            {currentType === TransactionType.DEBT_GIVEN ? "Lent to" : "Borrowed from"}
          </Label>
          <Input
            id="counterparty"
            {...form.register("counterparty")}
            placeholder="Enter person/organization name"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="event_date">Date</Label>
        <Input
          id="event_date"
          type="date"
          {...form.register("event_date")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          {...form.register("note")}
          placeholder="Add any additional notes..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading 
            ? (initialData ? "Updating..." : "Adding...") 
            : (isDebtForm 
                ? (initialData ? "Update Entry" : "Add Entry")
                : (initialData ? `Update ${type.charAt(0) + type.slice(1).toLowerCase()}` : `Add ${type.charAt(0) + type.slice(1).toLowerCase()}`)
              )
          }
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
