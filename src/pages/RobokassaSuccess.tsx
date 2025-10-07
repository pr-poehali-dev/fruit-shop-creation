import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const RobokassaSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        
        fetch(`https://functions.poehali.dev/6a6bb7f6-2fc1-4d4e-8d87-3ebc5d354abe?user_id=${user.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          })
          .catch(() => {});
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const amount = searchParams.get('OutSum');
  const invoiceId = searchParams.get('InvId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {isVerifying ? (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Icon name="Loader2" size={48} className="text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Проверяем платёж...
            </h1>
            <p className="text-gray-600 mb-6">
              Подождите, мы обновляем ваш баланс
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="CheckCircle2" size={48} className="text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Оплата прошла успешно!
            </h1>
            
            <p className="text-gray-600 mb-6">
              {amount && `Ваш баланс пополнен на ${amount}₽`}
            </p>

            {invoiceId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500">Номер платежа</p>
                <p className="text-lg font-mono font-semibold text-gray-900">
                  #{invoiceId}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full h-12 text-base font-semibold"
              >
                <Icon name="Home" size={20} className="mr-2" />
                Вернуться на главную
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">
                Баланс обновится автоматически в течение минуты
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RobokassaSuccess;
