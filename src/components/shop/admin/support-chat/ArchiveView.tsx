import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ArchivedChat, ChatMessage } from './types';

interface ArchiveViewProps {
  archivedChats: ArchivedChat[];
  selectedArchive: ArchivedChat | null;
  onSelectArchive: (archive: ArchivedChat) => void;
  onDeleteArchive: (archiveId: number) => void;
  onBack: () => void;
  isSuperAdmin: boolean;
}

export default function ArchiveView({
  archivedChats,
  selectedArchive,
  onSelectArchive,
  onDeleteArchive,
  onBack,
  isSuperAdmin,
}: ArchiveViewProps) {
  const getArchivedMessages = (messagesJson: string): ChatMessage[] => {
    try {
      return JSON.parse(messagesJson);
    } catch {
      return [];
    }
  };

  if (selectedArchive) {
    const messages = getArchivedMessages(selectedArchive.messages_json);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад к списку
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Archive" size={20} />
              {selectedArchive.user_name || 'Гость'}
              {selectedArchive.is_missed && (
                <Badge variant="destructive" className="ml-2">
                  Пропущен
                </Badge>
              )}
            </CardTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              {selectedArchive.user_phone && <p>📱 {selectedArchive.user_phone}</p>}
              {selectedArchive.admin_name && <p>👤 Администратор: {selectedArchive.admin_name}</p>}
              {selectedArchive.is_missed && <p className="text-destructive">⚠️ Чат пропущен из-за неактивности (30+ мин)</p>}
              <p>📅 Закрыт: {new Date(selectedArchive.closed_at).toLocaleString('ru-RU')}</p>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.sender_type === 'admin'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : msg.sender_type === 'bot'
                        ? 'bg-blue-100 dark:bg-blue-900 mr-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {msg.sender_type === 'admin' ? '👤' : msg.sender_type === 'bot' ? '🤖' : '👨‍💼'}{' '}
                        {msg.sender_name}
                      </span>
                      <span className="text-xs opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {isSuperAdmin && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Удалить этот чат из архива?')) {
                      onDeleteArchive(selectedArchive.id);
                    }
                  }}
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить из архива
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const missedChatsCount = archivedChats.filter(c => c.is_missed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Icon name="Archive" size={20} />
          Архив чатов ({archivedChats.length})
        </h3>
        {missedChatsCount > 0 && (
          <Badge variant="destructive">
            Пропущено: {missedChatsCount}
          </Badge>
        )}
      </div>

      {archivedChats.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Icon name="Archive" size={48} className="mx-auto mb-2 opacity-50" />
            <p>Архив пуст</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {archivedChats.map((archive) => (
            <Card
              key={archive.id}
              className={`cursor-pointer hover:border-primary transition-colors ${
                archive.is_missed ? 'border-destructive/50' : ''
              }`}
              onClick={() => onSelectArchive(archive)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{archive.user_name || 'Гость'}</span>
                      {archive.is_missed && (
                        <Badge variant="destructive" className="text-xs">
                          Пропущен
                        </Badge>
                      )}
                    </div>
                    {archive.user_phone && (
                      <div className="text-sm text-muted-foreground">📱 {archive.user_phone}</div>
                    )}
                    {archive.admin_name && (
                      <div className="text-sm text-muted-foreground">👤 {archive.admin_name}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(archive.closed_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}