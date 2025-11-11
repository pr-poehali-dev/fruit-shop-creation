import { useEffect } from 'react';

const API_STATISTICS = 'https://functions.poehali.dev/5417d2b2-c525-4686-856d-577e2d90240c';

export function useVisitorTracking() {
  useEffect(() => {
    // Генерируем или получаем visitor_id
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitor_id', visitorId);
    }

    // Определяем платформу и браузер
    const userAgent = navigator.userAgent;
    const platform = getPlatform(userAgent);
    const browser = getBrowser(userAgent);
    const deviceType = getDeviceType(userAgent);
    const referer = document.referrer || '';

    // Отправляем данные о визите
    const trackVisit = async () => {
      try {
        await fetch(API_STATISTICS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitor_id: visitorId,
            user_agent: userAgent,
            referer: referer,
            platform: platform,
            browser: browser,
            device_type: deviceType
          })
        });
      } catch (error) {
        console.error('Failed to track visit:', error);
      }
    };

    trackVisit();

    // Обновляем активность каждые 2 минуты
    const interval = setInterval(trackVisit, 120000);

    return () => clearInterval(interval);
  }, []);
}

function getPlatform(userAgent: string): string {
  if (userAgent.includes('Win')) return 'Windows';
  if (userAgent.includes('Mac')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
}

function getBrowser(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Unknown';
}

function getDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) return 'mobile';
  if (/Tablet|iPad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}
