import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Camera, Loader2, Save } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://square-net-backend-production.up.railway.app';

const buildAssetUrl = (path) => {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  // if stored as /uploads/..., prefix API base in dev environments
  if (path.startsWith('/uploads/')) {
    // توافق مع بيانات قديمة كانت تحفظ /uploads/users/... بينما السيرفر يخدمها كـ /users/...
    return `${API_BASE_URL}${path.replace('/uploads/', '/')}`;
  }
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
};

const accountTypeLabel = (user) => {
  if (!user) return '';
  if (user.role === 'superadmin') return 'مدير عام المنصة';
  if (user.role === 'admin') return 'مدير النظام';
  if (user.accountType === 'owner') return 'صاحب عقار';
  if (user.accountType === 'agent') return 'وسيط';
  return 'عميل';
};

export default function ProfilePage() {
  const { currentUser, token, updateCurrentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    accountType: '',
  });

  const [localPhotoUrl, setLocalPhotoUrl] = useState('');

  // Theme logic (same pattern used in other pages)
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'تعذر تحميل بيانات الحساب');

        const u = data.data;
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          bio: u.bio || '',
          address: u.address || '',
          accountType: u.accountType || '',
        });
        updateCurrentUser(u);
      } catch (e) {
        setError(e.message || 'حدث خطأ أثناء تحميل الملف الشخصي');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const profileImg = useMemo(() => {
    return localPhotoUrl || buildAssetUrl(currentUser?.profileImg);
  }, [localPhotoUrl, currentUser?.profileImg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          bio: form.bio,
          address: form.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'تعذر حفظ البيانات');
      updateCurrentUser(data.data);
      setSuccess('تم حفظ البيانات بنجاح');
    } catch (e2) {
      setError(e2.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalPhotoUrl(URL.createObjectURL(file));
    setPhotoSaving(true);
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      fd.append('profileImg', file);
      const res = await fetch(`${API_BASE_URL}/api/v1/users/me/photo`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'تعذر رفع الصورة');
      updateCurrentUser(data.data);
      setSuccess('تم تحديث الصورة الشخصية');
      setLocalPhotoUrl('');
    } catch (e2) {
      setError(e2.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setPhotoSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-arabic" dir="rtl">
        يجب تسجيل الدخول لعرض الملف الشخصي
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground font-sans transition-colors duration-300 flex flex-col" dir="rtl">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-6 sm:py-10">
        <div className="bg-card border border-border rounded-3xl shadow-sm p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                {profileImg ? (
                  <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-zinc-500 font-bold">SN</span>
                )}
              </div>
              <label className="absolute bottom-0 end-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                {photoSaving ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold truncate">{form.name || currentUser.fullName}</h1>
              <p className="text-muted-foreground mt-1 font-medium truncate">{form.email || currentUser.email}</p>
              <div className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-bold">
                {accountTypeLabel(currentUser)}
              </div>
            </div>
          </div>

          <div className="mt-6">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                {success}
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center text-primary">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-muted-foreground mb-2">الاسم</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-3 px-4 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">رقم الهاتف</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-3 px-4 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">العنوان</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-3 px-4 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-muted-foreground mb-2">نبذة</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-3 px-4 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium resize-y"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  حفظ التعديلات
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}


