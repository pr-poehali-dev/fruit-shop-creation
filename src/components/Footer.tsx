import Icon from '@/components/ui/icon';

const Footer = () => {
  const handleShare = async () => {
    const shareData = {
      title: 'Сад Мечты — питомник растений',
      text: '🌱 Качественные саженцы плодовых деревьев и декоративных растений в Барнауле',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Поделиться отменено');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена!');
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Icon name="Share2" size={18} />
            <span className="text-sm font-medium">Поделиться сайтом</span>
          </button>
          
          <p className="flex items-center justify-center gap-2 text-sm opacity-80">
            <Icon name="Flower2" size={20} />
            © 2024 Питомник растений. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;