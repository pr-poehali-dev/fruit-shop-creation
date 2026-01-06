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
              <div className="w-[20px] h-[20px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.18 14.49h-1.58c-.87 0-1.13-.69-2.69-2.25-1.35-1.33-1.95-1.51-2.29-1.51-.47 0-.6.13-.6.75v2.05c0 .55-.18.88-1.62.88-2.39 0-5.03-1.45-6.89-4.15-2.8-4-3.57-7-3.57-7.61 0-.34.13-.66.75-.66h1.58c.56 0 .77.26.99.86.99 2.92 2.65 5.48 3.33 5.48.26 0 .38-.12.38-.78V9.75c-.09-1.49-.87-1.62-.87-2.15 0-.27.22-.54.58-.54h2.48c.47 0 .64.25.64.81v4.37c0 .47.21.64.34.64.26 0 .47-.17.95-.65 1.46-1.64 2.51-4.18 2.51-4.18.14-.3.39-.59.99-.59h1.58c.67 0 .82.34.67.81-.23 1.05-2.86 4.88-2.86 4.88-.22.35-.3.51 0 .91.21.3.9.88 1.36 1.42.84.9 1.48 1.65 1.65 2.18.17.52-.09.78-.75.78z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">ВКонтакте</span>
            </button>
            
            <button
              onClick={shareTelegram}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="w-[20px] h-[20px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">Telegram</span>
            </button>
            
            <button
              onClick={shareWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="w-[20px] h-[20px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
            
            <button
              onClick={shareViber}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="w-[20px] h-[20px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.693 6.698.623 9.82c-.06 3.11-.13 8.95 5.5 10.541v2.42s-.038.97.602 1.17c.79.25 1.24-.499 1.99-1.299l1.4-1.58c3.85.32 6.8-.419 7.14-.529.78-.25 5.181-.811 5.901-6.652.74-6.031-.36-9.831-2.34-11.551l-.01-.002c-.6-.55-3-2.3-8.37-2.32 0 0-.396-.025-1.038-.016zm.067 1.697c.545-.003.88.02.88.02 4.54.01 6.711 1.38 7.221 1.84 1.67 1.429 2.528 4.856 1.9 9.892-.6 4.88-4.17 5.19-4.83 5.4-.28.09-2.88.73-6.152.52 0 0-2.439 2.941-3.199 3.701-.12.13-.26.17-.35.15-.13-.03-.17-.19-.16-.41l.02-4.019c-4.771-1.32-4.491-6.302-4.441-8.902.06-2.6.55-4.732 2-6.172 1.957-1.77 5.475-2.01 7.11-2.02zm.36 2.6a.299.299 0 00-.3.299.3.3 0 00.3.3 5.631 5.631 0 014.03 1.59A5.402 5.402 0 0117.488 10a.3.3 0 00.3.3.299.299 0 00.3-.3 5.994 5.994 0 00-1.743-4.221 6.224 6.224 0 00-4.431-1.757.3.3 0 00-.09-.023zm-3.453.608a.955.955 0 00-.615.12l-.012.004c-.32.14-.638.433-.776.816-.146.41-.23.76-.16 1.18.049.639.232 1.569.696 2.609v.004c.37.83.768 1.53 1.367 2.368.069.107.138.195.207.297l.01.012c1.016 1.258 1.972 2.14 3.152 2.939.128.09.252.18.385.27.062.04.125.09.195.13.088.06.174.11.26.16.48.31 1.053.64 1.602.77l.016.01c.027.01.054.02.084.03a.85.85 0 00.184.04c.316.05.549-.03.762-.11a2.2 2.2 0 00.325-.16 3.03 3.03 0 00.087-.05c.07-.04.134-.09.203-.14.022-.02.047-.03.07-.05.093-.07.19-.16.282-.25.398-.43.645-.907.457-1.433a1.25 1.25 0 00-.597-.56c-.06-.03-.117-.06-.174-.08a13.77 13.77 0 00-1.433-.64 4.61 4.61 0 00-.402-.14c-.12-.04-.24-.08-.362-.09a.854.854 0 00-.644.21c-.043.04-.087.08-.13.12-.198.2-.397.41-.596.61-.031.03-.068.06-.102.09a.683.683 0 01-.668.11c-.043-.02-.086-.03-.13-.05a4.308 4.308 0 01-.334-.14 7.184 7.184 0 01-2.392-1.94c-.068-.08-.125-.15-.18-.23a3.298 3.298 0 01-.325-.43c-.04-.06-.087-.12-.118-.18a.804.804 0 01.11-.55c.04-.05.09-.11.14-.16.12-.14.245-.27.367-.4.04-.04.078-.09.117-.13.206-.24.29-.48.335-.65.049-.19.03-.42-.14-.76a13.385 13.385 0 00-.585-1.058l-.01-.012c-.095-.16-.192-.33-.293-.49a1.02 1.... [truncated]
                </svg>
              </div>
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