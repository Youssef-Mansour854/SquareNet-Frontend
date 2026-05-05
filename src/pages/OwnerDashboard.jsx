import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertiesContext';
import { LayoutDashboard, Plus, Home as HomeIcon, Eye, CheckCircle2, Heart, Pencil, Trash2 } from 'lucide-react';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getPropertiesByOwnerId, propertyViews, propertyFavsCount, deleteProperty, updatePropertyStatus } = useProperties();
  const [ownerProperties, setOwnerProperties] = useState([]);
  const [isDeleting, setIsDeleting] = useState(null);

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

  useEffect(() => {
    if (!currentUser || currentUser.accountType !== 'owner') {
      navigate('/');
    } else if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
      navigate('/admin');
    } else {
      setOwnerProperties(getPropertiesByOwnerId(currentUser.id));
    }
  }, [currentUser, navigate, getPropertiesByOwnerId]);

  const totalViews = ownerProperties.reduce((acc, prop) => acc + (propertyViews[prop.id] || 0), 0);
  const totalFavs = ownerProperties.reduce((acc, prop) => acc + (propertyFavsCount[prop.id] || 0), 0);

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العقار بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setIsDeleting(id);
      await deleteProperty(id);
      setIsDeleting(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await updatePropertyStatus(id, newStatus);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300" dir="rtl">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-zinc-900 dark:bg-zinc-100 rounded-2xl flex items-center justify-center">
              <LayoutDashboard size={28} className="text-white dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground mb-1">لوحة تحكم المالك</h1>
              <p className="text-muted-foreground font-medium">مرحباً بك مجدداً، {currentUser.fullName}</p>
            </div>
          </div>
          <Link
            to="/add-property"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:bg-primary/90 transition"
          >
            <Plus size={20} />
            إضافة عقار جديد
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <HomeIcon size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-bold">إجمالي العقارات</p>
              <h3 className="text-2xl font-black">{ownerProperties.length}</h3>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-bold">العقارات النشطة</p>
              <h3 className="text-2xl font-black">{ownerProperties.length}</h3>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-bold">إجمالي المشاهدات</p>
              <h3 className="text-2xl font-black">{totalViews}</h3>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400">
              <Heart size={24} className="fill-red-500 dark:fill-red-400" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-bold">مرّات الإضافة للمفضلة</p>
              <h3 className="text-2xl font-black">{totalFavs}</h3>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">عقاراتي</h2>
          {ownerProperties.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-10 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <HomeIcon size={32} className="text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">لا توجد عقارات بعد</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                لم تقم بإضافة أي عقارات حتى الآن. اضغط على الزر أدناه للبدء في إضافة أول عقار لك.
              </p>
              <Link
                to="/add-property"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl shadow-md transition-colors"
              >
                <Plus size={20} />
                إضافة عقار
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownerProperties.map((prop) => (
                <div key={prop.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm group">
                  <div className="relative h-48">
                    <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-foreground">
                      {prop.type}
                    </div>
                    <div className="absolute top-3 left-3 flex gap-2">
                      {prop.status === 'sold' && (
                        <div className="bg-red-500/90 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          مباع
                        </div>
                      )}
                      {prop.status === 'reserved' && (
                        <div className="bg-yellow-500/90 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          محجوز
                        </div>
                      )}
                      {(!prop.status || prop.status === 'available') && (
                        <div className="bg-green-500/90 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          متاح
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1 truncate">{prop.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{prop.location}</p>
                    
                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 w-fit px-2 py-1 rounded-md">
                      <Heart size={14} className="fill-red-500 dark:fill-red-400" />
                      أضيف للمفضلة {propertyFavsCount[prop.id] || 0} مرات
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-foreground">{prop.price.toLocaleString('en-US')} ج.م</span>
                      <Link to={`/property/${prop.id}`} className="text-sm font-bold text-primary hover:underline">
                        عرض التفاصيل
                      </Link>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2 items-center justify-between">
                      <div className="flex gap-2">
                        <Link to={`/edit-property/${prop.id}`} className="flex items-center gap-1 text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition-colors">
                          <Pencil size={14} />
                          تعديل
                        </Link>
                        <button 
                          onClick={() => handleDelete(prop.id)} 
                          disabled={isDeleting === prop.id}
                          className="flex items-center gap-1 text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {isDeleting === prop.id ? 'جاري الحذف...' : 'حذف'}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <select 
                          value={prop.status || 'available'} 
                          onChange={(e) => handleStatusChange(prop.id, e.target.value)}
                          className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer border border-border outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="available">متاح</option>
                          <option value="reserved">محجوز</option>
                          <option value="sold">مباع</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OwnerDashboard;
