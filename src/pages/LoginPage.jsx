import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import { Mail, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const redirectPath = location.state?.from || '/';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = await login(formData);

    setIsSubmitting(false);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    navigate(redirectPath, { replace: true });
  };

  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="مرحبًا بعودتك! يرجى إدخال بياناتك للمتابعة"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-muted-foreground">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <Mail className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="block w-full appearance-none rounded-xl border border-border bg-muted px-4 py-3 pr-10 text-foreground transition-colors placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-100 sm:text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-bold text-muted-foreground">
              كلمة المرور
            </label>
            <Link to="/forgot-password" className="text-sm font-semibold text-foreground transition-colors hover:text-foreground">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <Lock className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="block w-full appearance-none rounded-xl border border-border bg-muted px-4 py-3 pr-10 text-foreground transition-colors placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-100 sm:text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-xl border border-transparent bg-zinc-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus:ring-zinc-100"
          >
            {isSubmitting ? 'جارٍ تسجيل الدخول...' : 'دخول'}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          ليس لديك حساب؟{' '}
          <Link to="/register" state={{ from: redirectPath }} className="font-bold text-foreground transition-colors hover:text-foreground">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
