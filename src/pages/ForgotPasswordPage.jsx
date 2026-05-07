import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://squarenet-backend-production.up.railway.app';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgotPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/verify-reset-code', { state: { email } });
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
      title="نسيت كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق لإعادة تعيين كلمة المرور"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-muted-foreground mb-2">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
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
            {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground font-medium">
          تذكرت كلمة المرور؟{' '}
          <Link to="/login" className="font-bold text-foreground hover:text-foreground transition-colors">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
