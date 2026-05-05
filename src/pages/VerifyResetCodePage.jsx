import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import { ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyResetCodePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [resetCode, setResetCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/verifyResetCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetCode }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/reset-password', { state: { email } });
      } else {
        setErrorMessage(data.message || 'الرمز غير صحيح أو منتهي الصلاحية');
      }
    } catch (err) {
      setErrorMessage('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="تحقق من الرمز"
      subtitle="أدخل رمز التحقق المكون من 6 أرقام الذي تم إرساله إلى بريدك الإلكتروني"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {email && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            تم إرسال الرمز إلى: {email}
          </div>
        )}

        <div>
          <label htmlFor="resetCode" className="block text-sm font-bold text-muted-foreground mb-2">
            رمز التحقق
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ShieldCheck className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="resetCode"
              name="resetCode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="appearance-none block w-full bg-muted border border-border rounded-xl py-3 px-4 pr-10 text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-colors sm:text-sm font-medium text-center tracking-[0.5em] text-lg"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || resetCode.length < 6}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all duration-300 disabled:opacity-60"
          >
            {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default VerifyResetCodePage;
