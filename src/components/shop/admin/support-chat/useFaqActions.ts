import { useToast } from '@/hooks/use-toast';
import { FAQ, SUPPORT_CHAT_URL } from './types';

export const useFaqActions = (loadFaqs: () => Promise<void>) => {
  const { toast } = useToast();

  const saveFaq = async (faq: { question: string; answer: string; keywords: string }) => {
    try {
      const keywords = faq.keywords.split(',').map((k) => k.trim()).filter(Boolean);
      
      await fetch(SUPPORT_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_faq',
          question: faq.question,
          answer: faq.answer,
          keywords,
        }),
      });
      
      toast({ title: 'FAQ создан' });
      loadFaqs();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать FAQ', variant: 'destructive' });
    }
  };

  const updateFaq = async (faq: FAQ) => {
    try {
      await fetch(SUPPORT_CHAT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faq_id: faq.id,
          question: faq.question,
          answer: faq.answer,
          keywords: faq.keywords,
          is_active: faq.is_active,
        }),
      });
      
      toast({ title: 'FAQ обновлен' });
      loadFaqs();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить FAQ', variant: 'destructive' });
    }
  };

  const deleteFaq = async (faqId: number) => {
    try {
      await fetch(SUPPORT_CHAT_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faq_id: faqId }),
      });
      
      toast({ title: 'FAQ удален' });
      loadFaqs();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить FAQ', variant: 'destructive' });
    }
  };

  return {
    saveFaq,
    updateFaq,
    deleteFaq,
  };
};
