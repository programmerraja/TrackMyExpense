
import { InvestmentType } from "@/types/investment";
import { InvestmentCalculationStrategy } from "./BaseCalculationStrategy";
import { PPFCalculationStrategy } from "./PPFStrategy";

export class StrategyFactory {
  private static strategies = new Map<InvestmentType, InvestmentCalculationStrategy>();

  static {
    this.strategies.set(InvestmentType.PPF, new PPFCalculationStrategy());
  }

  static getStrategy(type: InvestmentType): InvestmentCalculationStrategy | null {
    return this.strategies.get(type) || null;
  }

  static canEditPastContributions(type: InvestmentType): boolean {
    const strategy = this.getStrategy(type);
    return strategy?.canEditPastContributions() || false;
  }
}
