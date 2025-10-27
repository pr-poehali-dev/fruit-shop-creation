import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  description: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    url: 'https://cdn.poehali.dev/projects/999e341c-34c8-439f-a5a7-6cab243ccc11/files/d0355945-8f9e-4481-b185-9c4664060422.jpg',
    title: 'Наш питомник',
    description: 'Широкий ассортимент декоративных и плодовых культур'
  },
  {
    id: 2,
    url: 'https://cdn.poehali.dev/projects/999e341c-34c8-439f-a5a7-6cab243ccc11/files/21628348-c6b1-44ed-943b-0f0a3fe711a5.jpg',
    title: 'Яблони в саду',
    description: 'Плодовые деревья с крупными сочными плодами'
  },
  {
    id: 3,
    url: 'https://cdn.poehali.dev/projects/999e341c-34c8-439f-a5a7-6cab243ccc11/files/fe15436f-8b9a-4b1d-913a-a954b3e05042.jpg',
    title: 'Цветущая вишня',
    description: 'Декоративные деревья для вашего участка'
  }
];

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
      scale: 0.8
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = galleryImages.length - 1;
      if (nextIndex >= galleryImages.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const handleBack = () => {
    window.history.back();
  };

  const currentImage = galleryImages[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden" style={{ overflowX: 'hidden' }}>
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
        >
          <Icon name="ArrowLeft" size={24} />
        </Button>
      </div>

      <div className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
        {currentIndex + 1} / {galleryImages.length}
      </div>

      <div className="h-screen flex items-center justify-center px-4 perspective-1000" style={{ touchAction: 'pan-y' }}>
        <div className="relative w-full max-w-5xl aspect-[4/3] overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                rotateY: { duration: 0.3 },
                scale: { duration: 0.3 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              dragDirectionLock={true}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute inset-0 w-full h-full"
              style={{ transformStyle: 'preserve-3d', touchAction: 'none' }}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900">
                <img
                  src={currentImage.url}
                  alt={currentImage.title}
                  className="w-full h-full object-contain select-none"
                  draggable="false"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 text-white">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold mb-2"
                  >
                    {currentImage.title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-gray-200"
                  >
                    {currentImage.description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            aria-label="Предыдущее фото"
          >
            <Icon name="ChevronLeft" size={28} />
          </button>

          <button
            onClick={() => paginate(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            aria-label="Следующее фото"
          >
            <Icon name="ChevronRight" size={28} />
          </button>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {galleryImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Перейти к фото ${index + 1}`}
          />
        ))}
      </div>

      <div className="fixed bottom-8 right-8 text-white/50 text-sm">
        <p>← → или свайп для перелистывания</p>
      </div>
    </div>
  );
};

export default Gallery;