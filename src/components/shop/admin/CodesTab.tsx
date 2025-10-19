import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

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

interface LoginCode {
  id: number;
  login_code: string;
  created_at: string;
  used_at: string | null;
  expires_at: string;
  user_name: string;
  phone: string;
  is_expired: boolean;
  is_used: boolean;
}

interface CodesTabProps {
  userId: number;
}

const CodesTab = ({ userId }: CodesTabProps) => {
  const [resetCodes, setResetCodes] = useState<ResetCode[]>([]);
  const [loginCodes, setLoginCodes] = useState<LoginCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/2cc7c24d-08b2-4c44-a9a7-8d09198dbefc?action=codes&user_id=' + userId, {
        headers: {
          'X-User-Id': userId.toString()
        }
      });
      const data = await response.json();
      if (data.reset_codes) setResetCodes(data.reset_codes);
      if (data.login_codes) setLoginCodes(data.login_codes);
    } catch (error) {
      console.error('Failed to load codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, [userId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusBadge = (code: ResetCode | LoginCode) => {
    if (code.is_used) {
      return <Badge variant="secondary">Использован</Badge>;
    }
    if (code.is_expired) {
      return <Badge variant="destructive">Истёк</Badge>;
    }
    return <Badge variant="default">Активен</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Коды доступа</h2>
          <p className="text-muted-foreground">Просмотр одноразовых кодов для входа и восстановления</p>
        </div>
        <Button onClick={loadCodes} variant="outline">
          <Icon name="RefreshCw" size={18} className="mr-2" />
          Обновить
        </Button>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">
            <Icon name="LogIn" size={16} className="mr-2" />
            Коды входа ({loginCodes.length})
          </TabsTrigger>
          <TabsTrigger value="reset">
            <Icon name="KeyRound" size={16} className="mr-2" />
            Коды восстановления ({resetCodes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-4">
          {loginCodes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-2" />
                <p>Кодов входа пока нет</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {loginCodes.map((code) => (
                <Card key={code.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-mono">{code.login_code}</CardTitle>
                        <CardDescription>
                          {code.user_name} • {code.phone}
                        </CardDescription>
                      </div>
                      {getStatusBadge(code)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Создан</p>
                        <p className="font-medium">{formatDate(code.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Истекает</p>
                        <p className="font-medium">{formatDate(code.expires_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Использован</p>
                        <p className="font-medium">{formatDate(code.used_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reset" className="space-y-4">
          {resetCodes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-2" />
                <p>Кодов восстановления пока нет</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resetCodes.map((code) => (
                <Card key={code.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-mono">{code.reset_code}</CardTitle>
                        <CardDescription>
                          {code.user_name} • {code.phone}
                        </CardDescription>
                      </div>
                      {getStatusBadge(code)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Создан</p>
                        <p className="font-medium">{formatDate(code.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Истекает</p>
                        <p className="font-medium">{formatDate(code.expires_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Использован</p>
                        <p className="font-medium">{formatDate(code.used_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodesTab;