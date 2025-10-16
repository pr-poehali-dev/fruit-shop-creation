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

const GallerySection = () => {
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

  const currentImage = galleryImages[currentIndex];

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-2">Наша галерея</h2>
          <p className="text-muted-foreground">Фотографии нашего питомника и растений</p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto aspect-[4/3] mb-4">
          <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium text-sm">
            {currentIndex + 1} / {galleryImages.length}
          </div>

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
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute inset-0 w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-card">
                <img
                  src={currentImage.url}
                  alt={currentImage.title}
                  className="w-full h-full object-contain select-none"
                  draggable="false"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 sm:p-8 text-white">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl font-bold mb-2"
                  >
                    {currentImage.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-base sm:text-lg text-gray-200"
                  >
                    {currentImage.description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <Button
            onClick={() => paginate(-1)}
            size="icon"
            variant="ghost"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white transition-all hover:scale-110 active:scale-95"
            aria-label="Предыдущее фото"
          >
            <Icon name="ChevronLeft" size={28} />
          </Button>

          <Button
            onClick={() => paginate(1)}
            size="icon"
            variant="ghost"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white transition-all hover:scale-110 active:scale-95"
            aria-label="Следующее фото"
          >
            <Icon name="ChevronRight" size={28} />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-primary/30 hover:bg-primary/50 w-2'
              }`}
              aria-label={`Перейти к фото ${index + 1}`}
            />
          ))}
        </div>

        <div className="text-center text-muted-foreground text-sm">
          <p>← → или свайп для перелистывания</p>
        </div>
      </div>
    </div>
  );
};

export default GallerySection;
