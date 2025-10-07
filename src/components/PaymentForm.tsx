import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

interface PaymentFormProps {
  amount: number;
  description: string;
  orderId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  description, 
  orderId,
  onSuccess,
  onError 
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Пожалуйста, укажите email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://functions.poehali.dev/f0f80937-02c6-4d05-89d9-df4f8ec67fb8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          description,
          order_id: orderId,
          email
        })
      });

      const data = await response.json();

      if (response.ok && data.confirmation_url) {
        window.location.href = data.confirmation_url;
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = data.error || 'Ошибка при создании платежа';
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Ошибка соединения с сервером';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="CreditCard" size={24} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Оплата заказа</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Сумма к оплате:</span>
          <span className="text-2xl font-bold text-primary">{amount.toFixed(2)} ₽</span>
        </div>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email для чека
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.ru"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Чек об оплате будет отправлен на этот email
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <Icon name="AlertCircle" size={18} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Icon name="Loader2" size={20} className="animate-spin" />
              <span>Создание платежа...</span>
            </>
          ) : (
            <>
              <Icon name="ShieldCheck" size={20} />
              <span>Перейти к оплате</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Icon name="Lock" size={14} />
          <span>Безопасная оплата</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="Shield" size={14} />
          <span>ЮKassa</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
