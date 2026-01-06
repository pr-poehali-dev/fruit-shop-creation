import { useState } from 'react';
import Icon from '@/components/ui/icon';

const ShareButton = () => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = 'Сад Мечты — питомник растений';

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    alert('Ссылка скопирована!');
    setShowShareMenu(false);
  };

  const shareVK = () => {
    window.open(`https://vk.com/share.php?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareTitle)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareViber = () => {
    window.open(`viber://forward?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Icon name="Share2" size={20} />
          <span className="font-medium">Поделиться</span>
        </button>
        
        {showShareMenu && (
          <div className="absolute bottom-full left-0 mb-3 bg-white text-gray-800 rounded-xl shadow-2xl p-2 min-w-[220px]">
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Icon name="Link" size={20} />
              <span className="text-sm font-medium">Скопировать ссылку</span>
            </button>
            
            <button
              onClick={shareVK}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Icon name="Share2" size={20} />
              <span className="text-sm font-medium">ВКонтакте</span>
            </button>
            
            <button
              onClick={shareTelegram}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Icon name="Send" size={20} />
              <span className="text-sm font-medium">Telegram</span>
            </button>
            
            <button
              onClick={shareWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Icon name="MessageCircle" size={20} />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
            
            <button
              onClick={shareViber}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Icon name="Phone" size={20} />
              <span className="text-sm font-medium">Viber</span>
            </button>
          </div>
        )}
      </div>
      
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </>
  );
};

export default ShareButton;
