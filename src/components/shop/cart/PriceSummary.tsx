import { Separator } from '@/components/ui/separator';

interface PriceSummaryProps {
  totalPrice: number;
  deliveryType: string;
  deliveryFee: number;
  finalPrice: number;
  preorderEnabled: boolean;
}

export const PriceSummary = ({
  totalPrice,
  deliveryType,
  deliveryFee,
  finalPrice,
  preorderEnabled
}: PriceSummaryProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Товары:</span>
        <span>{totalPrice} ₽</span>
      </div>
      {deliveryType === 'delivery' && deliveryFee > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Доставка:</span>
          <span>{deliveryFee} ₽</span>
        </div>
      )}
      <Separator />
      {preorderEnabled ? (
        <>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Итого:</span>
            <span className="line-through">{finalPrice} ₽</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-700 rounded p-2">
            <div className="flex justify-between items-center">
              <span className="text-blue-900 dark:text-blue-100 font-bold text-lg">К оплате (предоплата 50%):</span>
              <span className="text-blue-900 dark:text-blue-100 font-bold text-lg">{(finalPrice * 0.5).toFixed(2)} ₽</span>
            </div>
            <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-1">Вторая часть — после перехода в обработку</p>
          </div>
        </>
      ) : (
        <div className="flex justify-between items-center font-bold text-lg">
          <span>Итого:</span>
          <span>{finalPrice} ₽</span>
        </div>
      )}
    </div>
  );
};