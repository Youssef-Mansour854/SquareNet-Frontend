import React, { useEffect, useState } from 'react';
import { Sun, Moon, Heart, MessageCircle, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import NotificationsDropdown from './NotificationsDropdown';

const Navbar = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { notifications } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getProfileImgUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads/')) return `${import.meta.env.VITE_API_BASE_URL || 'https://squarenet-backend-production.up.railway.app'}${path.replace('/uploads/', '/')}`;
    if (path.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL || 'https://squarenet-backend-production.up.railway.app'}${path}`;
    return `${import.meta.env.VITE_API_BASE_URL || 'https://squarenet-backend-production.up.railway.app'}/${path}`;
  };

  // Count unread message notifications
  const unreadMessages = notifications.filter(n => n.type === 'new_message' && !n.isRead).length;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getLinkClasses = (path) => {
    const isActive =
      location.pathname === path ||
      (path === '/properties' && location.pathname.startsWith('/property/'));

    return `${
      isActive
        ? 'text-foreground font-bold border-b-2 border-zinc-900 dark:border-white'
        : 'text-muted-foreground hover:text-foreground'
    } pb-1 transition-all`;
  };

  return (
    <nav className="bg-background/95 border-b border-border backdrop-blur-md transition-colors duration-300 sticky top-0 z-50">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
      <Link to="/" className="text-2xl font-black tracking-tight text-foreground cursor-pointer">
        Square <span className="text-primary">Net</span>
      </Link>

      <div className="hidden md:flex gap-6 text-sm font-semibold items-center">
        <Link to="/" className={getLinkClasses('/')}>الرئيسية</Link>
        <Link to="/properties" className={getLinkClasses('/properties')}>تصفح العقارات</Link>
        <Link to="#" className={getLinkClasses('/about')}>من نحن</Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-border"
          aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="hidden sm:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {currentUser?.accountType === 'owner' && currentUser?.role === 'user' && (
                <Link to="/dashboard" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  لوحة التحكم
                </Link>
              )}
              {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
                <Link to="/admin" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  لوحة المدير
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                {currentUser?.profileImg ? (
                  <img
                    src={getProfileImgUrl(currentUser.profileImg)}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-8 h-8 rounded-full bg-primary/10 text-primary items-center justify-center font-bold border border-border shrink-0 ${currentUser?.profileImg ? 'hidden' : 'flex'}`}
                >
                  {currentUser?.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <span className="hidden lg:block">{currentUser?.fullName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded-full transition-all shadow-sm"
              >
                تسجيل خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                تسجيل دخول
              </Link>
              <Link to="/register" className="text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded-full transition-all shadow-sm">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>

        <Link
          to="/favorites"
          aria-label="Favorites"
          className="relative text-foreground hover:text-foreground transition-colors mt-1 items-center justify-center hidden md:flex"
        >
          <Heart
            size={20}
            className={`${location.pathname === '/favorites' ? 'fill-foreground' : 'fill-transparent'}`}
            strokeWidth={2.5}
          />
          {isAuthenticated && favorites.length > 0 ? (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
              {favorites.length}
            </span>
          ) : null}
        </Link>

        {isAuthenticated && (
          <Link
            to="/chat"
            aria-label="Messages"
            className="relative text-foreground hover:text-foreground transition-colors mt-1 hidden md:flex items-center justify-center p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <MessageCircle
              size={20}
              className={`${location.pathname === '/chat' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              strokeWidth={2.5}
            />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </Link>
        )}

        <div className="hidden md:block">
          {isAuthenticated && <NotificationsDropdown />}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors outline-none border border-border"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-3 pb-4">
          <div className="rounded-xl border border-border bg-background shadow-sm p-3 flex flex-col gap-3" dir="rtl">
            <div className="flex flex-col gap-2 text-sm font-semibold">
              <Link to="/" className={getLinkClasses('/')}>الرئيسية</Link>
              <Link to="/properties" className={getLinkClasses('/properties')}>تصفح العقارات</Link>
              <Link to="#" className={getLinkClasses('/about')}>من نحن</Link>
              {isAuthenticated && currentUser?.accountType === 'owner' && currentUser?.role === 'user' && (
                <Link to="/dashboard" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  لوحة التحكم
                </Link>
              )}
              {isAuthenticated && (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
                <Link to="/admin" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  لوحة المدير
                </Link>
              )}
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  to="/favorites"
                  aria-label="Favorites"
                  className="relative text-foreground hover:text-foreground transition-colors flex items-center justify-center p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Heart
                    size={20}
                    className={`${location.pathname === '/favorites' ? 'fill-foreground' : 'fill-transparent'}`}
                    strokeWidth={2.5}
                  />
                  {isAuthenticated && favorites.length > 0 ? (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-background">
                      {favorites.length}
                    </span>
                  ) : null}
                </Link>

                {isAuthenticated && (
                  <Link
                    to="/chat"
                    aria-label="Messages"
                    className="relative text-foreground hover:text-foreground transition-colors flex items-center justify-center p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <MessageCircle
                      size={20}
                      className={`${location.pathname === '/chat' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      strokeWidth={2.5}
                    />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-background">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>
                )}
              </div>

              {isAuthenticated && <NotificationsDropdown />}
            </div>

            <div className="h-px bg-border" />

            {isAuthenticated ? (
              <div className="flex items-center justify-between gap-3">
                <Link to="/profile" className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors truncate">
                  {currentUser?.profileImg ? (
                    <img
                      src={getProfileImgUrl(currentUser.profileImg)}
                      alt={currentUser.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-10 h-10 rounded-full bg-primary/10 text-primary items-center justify-center font-bold border border-border shrink-0 ${currentUser?.profileImg ? 'hidden' : 'flex'}`}
                  >
                    {currentUser?.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="truncate">{currentUser?.fullName}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full transition-all shadow-sm"
                >
                  تسجيل خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="flex-1 text-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors border border-border rounded-full py-2">
                  تسجيل دخول
                </Link>
                <Link to="/register" className="flex-1 text-center text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-2 shadow-sm">
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
