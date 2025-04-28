import formatCurrencyInput from "../utils/formatRealCoin";

export default function formatCurrencyWithSmallCents(value: string) {
    const formatted = formatCurrencyInput(value);
    const [main, cents] = formatted.split(',');
    
    return (
      <>
        {main},
        <span className="text-xs font-normal">{cents}</span>
      </>
    );
  }