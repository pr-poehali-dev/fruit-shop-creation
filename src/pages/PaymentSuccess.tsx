import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="CheckCircle2" size={48} className="text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Оплата прошла успешно!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Спасибо за ваш заказ. Чек об оплате отправлен на указанный email.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Вернуться на главную
          </button>
          
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Мои заказы
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
