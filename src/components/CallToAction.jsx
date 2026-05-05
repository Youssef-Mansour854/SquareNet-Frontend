import { Link } from 'react-router-dom';
import ctaBg from '../assets/images/interior-bg.jpg';

const CallToAction = () => {
  return (
    <section className="relative py-32 px-4 text-center transition-colors duration-300 border-t border-zinc-100 dark:border-zinc-900 overflow-hidden">
      
      {/* Background Image of Sleek Modern Home Interior */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}
      ></div>
      
      {/* Muted Dark Overlay */}
      <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 drop-shadow-sm">
          سجل معانا الان
        </h2>
        <div className="flex flex-col gap-3 mb-12">
          <p className="text-2xl text-foreground font-bold drop-shadow-sm">
            ابدأ رحلتك العقارية
          </p>
          <p className="text-lg text-muted-foreground font-medium">
            احفظ عقاراتك المفضلة وكن أول من يعلم بأحدث العروض
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/register" className="w-full sm:w-auto px-12 py-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-lg text-center">
            إنشاء حساب
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-12 py-4 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-foreground font-bold rounded-full transition-all duration-300 shadow-md text-lg text-center border-none">
            تسجيل دخول
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
