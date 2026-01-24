const NatureBackground = () => {
  return (
    <>
      <div className="flex w-full md:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-800 to-teal-700 min-h-[200px] md:min-h-[600px]">
        <div className="absolute inset-0">
          <div className="sun"></div>
          <div className="leaf leaf-1"></div>
          <div className="leaf leaf-2"></div>
          <div className="leaf leaf-3"></div>
          <div className="leaf leaf-4"></div>
          <div className="leaf leaf-5"></div>
          <div className="leaf leaf-6"></div>
          <div className="leaf leaf-7"></div>
          <div className="leaf leaf-8"></div>
          <div className="flower flower-1"></div>
          <div className="flower flower-2"></div>
          <div className="flower flower-3"></div>
          <div className="flower flower-4"></div>
          <div className="butterfly butterfly-1"></div>
          <div className="butterfly butterfly-2"></div>
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
          <div className="grass"></div>
          <div className="bird bird-1"></div>
          <div className="bird bird-2"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center p-8 text-white">
          <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Питомник растений</h2>
          <p className="text-lg opacity-90 drop-shadow">Качественные саженцы для вашего сада</p>
        </div>
      </div>
    </>
  );
};

export default NatureBackground;