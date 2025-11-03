interface LogActivityParams {
  userId: number;
  actionType: string;
  actionDescription: string;
  targetEntityType?: string;
  targetEntityId?: number;
  metadata?: Record<string, any>;
}

export async function logUserActivity(params: LogActivityParams): Promise<void> {
  try {
    const response = await fetch('https://functions.poehali.dev/14c40ab2-8b60-4ccc-b428-bb824cb6871c', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'user',
        action: 'create',
        user_id: params.userId,
        action_type: params.actionType,
        action_description: params.actionDescription,
        target_entity_type: params.targetEntityType,
        target_entity_id: params.targetEntityId,
        metadata: params.metadata || {},
      }),
    });

    if (!response.ok) {
      console.error('Failed to log user activity:', await response.text());
    }
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
}

export const ActivityTypes = {
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  PRODUCT_VIEW: 'product_view',
  PRODUCT_ADD_TO_CART: 'product_add_to_cart',
  PRODUCT_REMOVE_FROM_CART: 'product_remove_from_cart',
  PRODUCT_ADD_TO_FAVORITES: 'product_add_to_favorites',
  PRODUCT_REMOVE_FROM_FAVORITES: 'product_remove_from_favorites',
  BALANCE_TOP_UP: 'balance_top_up',
  BALANCE_DEDUCT: 'balance_deduct',
  ORDER_CREATE: 'order_create',
  ORDER_CANCEL: 'order_cancel',
  ORDER_PREORDER_PAYMENT: 'order_preorder_payment',
  ORDER_DELIVERY_PAYMENT: 'order_delivery_payment',
  CASHBACK_EXCHANGE: 'cashback_exchange',
  LOYALTY_CARD_PURCHASE: 'loyalty_card_purchase',
  PROFILE_UPDATE: 'profile_update',
  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',
  SUPPORT_MESSAGE: 'support_message',
  RATING_SUBMIT: 'rating_submit',
} as const;