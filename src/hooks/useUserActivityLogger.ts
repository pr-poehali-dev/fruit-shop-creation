import { useCallback } from 'react';
import { logUserActivity, ActivityTypes } from '@/utils/userActivityLogger';

interface UseUserActivityLoggerProps {
  userId?: number;
  isAuthenticated: boolean;
}

export function useUserActivityLogger({ userId, isAuthenticated }: UseUserActivityLoggerProps) {
  const log = useCallback(
    async (
      actionType: string,
      actionDescription: string,
      targetEntityType?: string,
      targetEntityId?: number,
      metadata?: Record<string, any>
    ) => {
      if (!isAuthenticated || !userId) return;

      await logUserActivity({
        userId,
        actionType,
        actionDescription,
        targetEntityType,
        targetEntityId,
        metadata,
      });
    },
    [userId, isAuthenticated]
  );

  const logPageView = useCallback(
    (pageName: string) => {
      log(ActivityTypes.PAGE_VIEW, `Просмотр страницы: ${pageName}`, undefined, undefined, { page: pageName });
    },
    [log]
  );

  const logProductView = useCallback(
    (productId: number, productName: string) => {
      log(
        ActivityTypes.PRODUCT_VIEW,
        `Просмотр товара: ${productName}`,
        'product',
        productId,
        { product_name: productName }
      );
    },
    [log]
  );

  const logAddToCart = useCallback(
    (productId: number, productName: string, variantId?: number, price?: number) => {
      log(
        ActivityTypes.PRODUCT_ADD_TO_CART,
        `Добавление в корзину: ${productName}`,
        'product',
        productId,
        { product_name: productName, variant_id: variantId, price }
      );
    },
    [log]
  );

  const logRemoveFromCart = useCallback(
    (productId: number, productName: string) => {
      log(
        ActivityTypes.PRODUCT_REMOVE_FROM_CART,
        `Удаление из корзины: ${productName}`,
        'product',
        productId,
        { product_name: productName }
      );
    },
    [log]
  );

  const logToggleFavorite = useCallback(
    (productId: number, productName: string, added: boolean) => {
      log(
        added ? ActivityTypes.PRODUCT_ADD_TO_FAVORITES : ActivityTypes.PRODUCT_REMOVE_FROM_FAVORITES,
        added ? `Добавление в избранное: ${productName}` : `Удаление из избранного: ${productName}`,
        'product',
        productId,
        { product_name: productName }
      );
    },
    [log]
  );

  const logBalanceTopUp = useCallback(
    (amount: number, method: string, transactionId?: number) => {
      log(
        ActivityTypes.BALANCE_TOP_UP,
        `Пополнение баланса на ${amount}₽`,
        'transaction',
        transactionId,
        { amount, method }
      );
    },
    [log]
  );

  const logBalanceDeduct = useCallback(
    (amount: number, reason: string, orderId?: number) => {
      log(
        ActivityTypes.BALANCE_DEDUCT,
        `Списание с баланса: ${amount}₽ (${reason})`,
        'order',
        orderId,
        { amount, reason }
      );
    },
    [log]
  );

  const logOrderCreate = useCallback(
    (orderId: number, totalAmount: number, itemsCount: number) => {
      log(
        ActivityTypes.ORDER_CREATE,
        `Создание заказа #${orderId} на сумму ${totalAmount}₽`,
        'order',
        orderId,
        { total_amount: totalAmount, items_count: itemsCount }
      );
    },
    [log]
  );

  const logOrderCancel = useCallback(
    (orderId: number) => {
      log(ActivityTypes.ORDER_CANCEL, `Отмена заказа #${orderId}`, 'order', orderId);
    },
    [log]
  );

  const logPreorderPayment = useCallback(
    (orderId: number, amount: number) => {
      log(
        ActivityTypes.ORDER_PREORDER_PAYMENT,
        `Оплата второй части предзаказа #${orderId} на ${amount}₽`,
        'order',
        orderId,
        { amount }
      );
    },
    [log]
  );

  const logDeliveryPayment = useCallback(
    (orderId: number, amount: number) => {
      log(
        ActivityTypes.ORDER_DELIVERY_PAYMENT,
        `Оплата доставки заказа #${orderId} на ${amount}₽`,
        'order',
        orderId,
        { amount }
      );
    },
    [log]
  );

  const logCashbackExchange = useCallback(
    (cashbackAmount: number, balanceAmount: number) => {
      log(
        ActivityTypes.CASHBACK_EXCHANGE,
        `Обмен кэшбэка: ${cashbackAmount} баллов → ${balanceAmount}₽`,
        undefined,
        undefined,
        { cashback_amount: cashbackAmount, balance_amount: balanceAmount }
      );
    },
    [log]
  );

  const logLoyaltyCardPurchase = useCallback(
    (cardType: string, price: number) => {
      log(
        ActivityTypes.LOYALTY_CARD_PURCHASE,
        `Покупка карты лояльности: ${cardType}`,
        'loyalty_card',
        undefined,
        { card_type: cardType, price }
      );
    },
    [log]
  );

  const logButtonClick = useCallback(
    (buttonName: string, location: string) => {
      log(
        ActivityTypes.BUTTON_CLICK,
        `Клик по кнопке: ${buttonName}`,
        undefined,
        undefined,
        { button_name: buttonName, location }
      );
    },
    [log]
  );

  return {
    logPageView,
    logProductView,
    logAddToCart,
    logRemoveFromCart,
    logToggleFavorite,
    logBalanceTopUp,
    logBalanceDeduct,
    logOrderCreate,
    logOrderCancel,
    logPreorderPayment,
    logDeliveryPayment,
    logCashbackExchange,
    logLoyaltyCardPurchase,
    logButtonClick,
  };
}
