import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import { Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://square-net-backend-production.up.railway.app';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('كلمة المرور وتأكيدها غير متطابقتين');
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrorMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/resetPassword`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: formData.newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/login', { state: { message: 'تم تغيير كلمة المرور بنجاح! يرجى تسجيل الدخول بالكلمة الجديدة.' } });
      } else {
        setErrorMessage(data.message || 'حدث خطأ، يرجى المحاولة لاحقاً');
      }
    } catch (err) {
      setErrorMessage('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="تعيين كلمة مرور جديدة"
      subtitle="أدخل كلمة المرور الجديدة لحسابك"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div>
          <label htmlFor="newPassword" className="block text-sm font-bold text-muted-foreground mb-2">
            كلمة المرور الجديدة
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="appearance-none block w-full bg-muted border border-border rounded-xl py-3 px-4 pr-10 text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-colors sm:text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-muted-foreground mb-2">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="appearance-none block w-full bg-muted border border-border rounded-xl py-3 px-4 pr-10 text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-colors sm:text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all duration-300 disabled:opacity-60"
          >
            {loading ? 'جاري تغيير كلمة المرور...' : 'تعيين كلمة المرور الجديدة'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

