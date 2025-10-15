import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Проверяем статус оплаты...');

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setStatus('error');
        setMessage('Отсутствует ID платежа');
        return;
      }

      try {
        const response = await fetch(
          `https://functions.poehali.dev/563d9333-4b51-4637-82a8-c2a66058792a?orderId=${orderId}`
        );
        const data = await response.json();

        if (data.success && data.orderStatus === 2) {
          setStatus('success');
          setMessage('Оплата прошла успешно! Спасибо за покупку.');
        } else if (data.orderStatus === 0) {
          setStatus('error');
          setMessage('Заказ зарегистрирован, но оплата не завершена');
        } else if (data.orderStatus === 6) {
          setStatus('error');
          setMessage('Оплата отклонена банком');
        } else {
          setStatus('error');
          setMessage(data.statusDescription || 'Неизвестный статус платежа');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Ошибка при проверке статуса платежа');
        console.error('Payment check error:', error);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'checking' && (
            <>
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
                <Icon name="Loader2" size={32} className="text-primary animate-spin" />
              </div>
              <CardTitle>Проверка оплаты</CardTitle>
              <CardDescription>Пожалуйста, подождите...</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Icon name="CheckCircle2" size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-600 dark:text-green-400">Оплата успешна!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <Icon name="XCircle" size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-600 dark:text-red-400">Ошибка оплаты</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {orderId && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground mb-1">ID платежа:</p>
              <p className="font-mono font-semibold break-all">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {status === 'success' && (
              <Button onClick={() => navigate('/')} className="w-full">
                <Icon name="Home" size={18} className="mr-2" />
                Вернуться на главную
              </Button>
            )}

            {status === 'error' && (
              <>
                <Button onClick={() => navigate('/')} variant="default" className="w-full">
                  <Icon name="Home" size={18} className="mr-2" />
                  Вернуться на главную
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                  <Icon name="RefreshCw" size={18} className="mr-2" />
                  Проверить снова
                </Button>
              </>
            )}
          </div>

          {status !== 'checking' && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              Если у вас возникли вопросы, свяжитесь с поддержкой
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
