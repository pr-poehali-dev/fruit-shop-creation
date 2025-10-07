import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ResetCode {
  id: number;
  phone: string;
  reset_code: string;
  created_at: string;
  used_at: string | null;
  expires_at: string;
  user_name: string;
  user_email: string;
  is_expired: boolean;
  is_used: boolean;
}

interface ResetCodesTabProps {
  onLoadCodes: () => Promise<ResetCode[]>;
}

const ResetCodesTab = ({ onLoadCodes }: ResetCodesTabProps) => {
  const [codes, setCodes] = useState<ResetCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const data = await onLoadCodes();
      setCodes(data);
    } catch (error) {
      console.error('Failed to load reset codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusBadge = (code: ResetCode) => {
    if (code.is_used) {
      return <Badge variant="outline" className="bg-gray-100">Использован</Badge>;
    }
    if (code.is_expired) {
      return <Badge variant="destructive">Истёк</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">Активен</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Коды восстановления пароля</h2>
        <Button onClick={loadCodes} disabled={loading}>
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon name="Loader2" size={32} className="mx-auto mb-2 animate-spin" />
            <p className="text-muted-foreground">Загрузка кодов...</p>
          </CardContent>
        </Card>
      ) : codes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon name="KeyRound" size={48} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Запросов на восстановление пароля пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {codes.map((code) => (
            <Card key={code.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{code.user_name || 'Без имени'}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {code.phone} • {code.user_email || 'Email не указан'}
                    </p>
                  </div>
                  {getStatusBadge(code)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Код восстановления</p>
                    <p className="text-xl font-mono font-bold tracking-wider">{code.reset_code}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(code.reset_code, code.id)}
                  >
                    <Icon name={copiedId === code.id ? "Check" : "Copy"} size={16} className="mr-2" />
                    {copiedId === code.id ? 'Скопировано' : 'Копировать'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Создан</p>
                    <p className="font-medium">{formatDate(code.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Истекает</p>
                    <p className="font-medium">{formatDate(code.expires_at)}</p>
                  </div>
                  {code.used_at && (
                    <div>
                      <p className="text-muted-foreground">Использован</p>
                      <p className="font-medium">{formatDate(code.used_at)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResetCodesTab;
