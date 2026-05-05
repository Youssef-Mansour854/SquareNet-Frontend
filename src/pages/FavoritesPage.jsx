import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { useFavorites } from '../context/FavoritesContext';
import { HeartCrack } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  const { isAuthenticated } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " ج.م";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground font-sans transition-colors duration-300 flex flex-col" dir="rtl">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            العقارات المفضلة
          </h1>
          <p className="text-muted-foreground font-medium">
            تصفح قائمة العقارات التي قمت بحفظها لسهولة الوصول إليها
          </p>
          <div className="w-20 h-1.5 bg-zinc-900 dark:bg-zinc-100 mt-6 rounded-full"></div>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-card rounded-2xl border border-border text-center shadow-sm">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <HeartCrack size={40} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">سجل دخولك أولًا لعرض المفضلة</h2>
            <p className="text-muted-foreground font-medium mb-8 max-w-md">
              لن تظهر أي عقارات في صفحة المفضلة قبل تسجيل الدخول أو إنشاء حساب جديد.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" state={{ from: '/favorites' }} className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full transition-colors duration-300 shadow-md">
                تسجيل دخول
              </Link>
              <Link to="/register" state={{ from: '/favorites' }} className="px-8 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-bold rounded-full transition-colors duration-300 shadow-md">
                إنشاء حساب
              </Link>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-card rounded-2xl border border-border text-center shadow-sm">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <HeartCrack size={40} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">لا توجد عقارات في المفضلة حاليًا</h2>
            <p className="text-muted-foreground font-medium mb-8 max-w-md">
              لم تقم بإضافة أي عقارات إلى قائمتك المفضلة حتى الآن. يمكنك استكشاف العقارات المتاحة وإضافتها بالضغط على أيقونة القلب.
            </p>
            <Link to="/properties" className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full transition-colors duration-300 shadow-md">
              ابدأ التصفح
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((prop) => (
              <PropertyCard
                key={prop.id}
                id={prop.id}
                image={prop.image}
                price={formatPrice(prop.price)}
                region={`${prop.title} - ${prop.location}`}
                rooms={prop.bedrooms}
                baths={prop.bathrooms}
                area={prop.area}
                fullProperty={prop}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
