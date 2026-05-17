import { Heart, LogIn, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthPromptModal = ({ isOpen, onClose, redirectTo = '/favorites' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" dir="rtl">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        aria-label="Close auth prompt"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 text-right shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 rounded-full bg-zinc-100 p-2 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
          <Heart size={24} className="fill-current" />
        </div>

        <h3 className="mb-2 text-2xl font-black text-foreground">
          احفظ العقارات المفضلة
        </h3>
        <p className="mb-6 text-sm font-medium leading-7 text-muted-foreground">
          أضف العقار إلى المفضلة بعد تسجيل الدخول، واحتفظ بقائمتك محفوظة وارجع لها في أي وقت.
        </p>

        <div className="grid gap-3">
          <Link
            to="/login"
            state={{ from: redirectTo }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 font-bold text-white transition-colors hover:bg-primary text-primary-foreground dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <LogIn size={18} />
            تسجيل دخول
          </Link>

          <Link
            to="/register"
            state={{ from: redirectTo }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-5 py-3 font-bold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            <UserPlus size={18} />
            إنشاء حساب
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
