import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaymentForm from '@/components/PaymentForm';
import Icon from '@/components/ui/icon';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const amount = parseFloat(searchParams.get('amount') || '0');
  const description = searchParams.get('description') || 'Оплата заказа';
  const orderId = searchParams.get('order_id') || undefined;

  if (amount <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertCircle" size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка</h2>
          <p className="text-gray-600 mb-4">Некорректная сумма платежа</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <Icon name="ArrowLeft" size={20} />
          <span>Назад</span>
        </button>
        
        <PaymentForm
          amount={amount}
          description={description}
          orderId={orderId}
          onSuccess={() => {
            console.log('Payment initiated successfully');
          }}
          onError={(error) => {
            console.error('Payment error:', error);
          }}
        />
      </div>
    </div>
  );
};

export default Payment;
