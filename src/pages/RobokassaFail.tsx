import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const RobokassaFail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="XCircle" size={48} className="text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Оплата не прошла
        </h1>
        
        <p className="text-gray-600 mb-6">
          Платёж был отменён или произошла ошибка при оплате
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            💡 Средства не были списаны с вашего счета
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full h-12 text-base font-semibold"
          >
            <Icon name="Home" size={20} className="mr-2" />
            Вернуться на главную
          </Button>
          
          <Button
            onClick={() => {
              window.location.href = '/';
            }}
            variant="outline"
            className="w-full h-12 text-base font-semibold"
          >
            <Icon name="RefreshCw" size={20} className="mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RobokassaFail;
