import { useToast } from '@/hooks/use-toast';
import { ArchivedChat, SUPPORT_CHAT_URL } from './types';

export const useArchiveActions = () => {
  const { toast } = useToast();

  const loadArchive = async (): Promise<ArchivedChat[]> => {
    try {
      const response = await fetch(`${SUPPORT_CHAT_URL}?archive=true`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка загрузки архива:', error);
      return [];
    }
  };

  const deleteArchivedChat = async (archiveId: number, onSuccess: () => void) => {
    try {
      await fetch(SUPPORT_CHAT_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_id: archiveId }),
      });
      
      toast({ title: 'Чат удалён из архива' });
      onSuccess();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить чат', variant: 'destructive' });
    }
  };

  return {
    loadArchive,
    deleteArchivedChat,
  };
};
