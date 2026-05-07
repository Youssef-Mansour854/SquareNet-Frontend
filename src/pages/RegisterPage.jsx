import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import { User, Mail, Phone, Lock, Home, UserCheck, Briefcase } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [formData, setFormData] = React.useState({
    accountType: 'buyer',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const redirectPath = location.state?.from || '/';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    // Frontend Validations
    if (formData.password.length < 6) {
      setErrorMessage('كلمة المرور يجب أن لا تقل عن 6 أحرف.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMessage('رقم الهاتف يجب أن يكون 11 رقم مصري صحيح يبدأ بـ 01.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    navigate('/login', { 
      replace: true, 
      state: { successMessage: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.' } 
    });
  };

  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="انضم إلى Square Net وابدأ رحلتك العقارية معنا"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div>
          <label className="mb-3 block text-sm font-bold text-muted-foreground">
            نوع الحساب
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="cursor-pointer">
              <input type="radio" name="accountType" value="buyer" className="peer sr-only" checked={formData.accountType === 'buyer'} onChange={handleChange} />
              <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-zinc-50 p-3 text-center text-sm font-bold text-zinc-500 transition-all hover:bg-zinc-100 peer-checked:border-zinc-900 peer-checked:bg-white peer-checked:text-zinc-900 peer-checked:shadow-sm dark:bg-zinc-950/50 dark:text-zinc-500 dark:hover:bg-zinc-900/50 dark:peer-checked:border-zinc-500 dark:peer-checked:bg-zinc-800 dark:peer-checked:text-white">
                <UserCheck size={20} />
                <span>باحث</span>
              </div>
            </label>

            <label className="cursor-pointer">
              <input type="radio" name="accountType" value="owner" className="peer sr-only" checked={formData.accountType === 'owner'} onChange={handleChange} />
              <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-zinc-50 p-3 text-center text-sm font-bold text-zinc-500 transition-all hover:bg-zinc-100 peer-checked:border-zinc-900 peer-checked:bg-white peer-checked:text-zinc-900 peer-checked:shadow-sm dark:bg-zinc-950/50 dark:text-zinc-500 dark:hover:bg-zinc-900/50 dark:peer-checked:border-zinc-500 dark:peer-checked:bg-zinc-800 dark:peer-checked:text-white">
                <Home size={20} />
                <span>مالك</span>
              </div>
            </label>

            <label className="cursor-pointer">
              <input type="radio" name="accountType" value="agent" className="peer sr-only" checked={formData.accountType === 'agent'} onChange={handleChange} />
              <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-zinc-50 p-3 text-center text-sm font-bold text-zinc-500 transition-all hover:bg-zinc-100 peer-checked:border-zinc-900 peer-checked:bg-white peer-checked:text-zinc-900 peer-checked:shadow-sm dark:bg-zinc-950/50 dark:text-zinc-500 dark:hover:bg-zinc-900/50 dark:peer-checked:border-zinc-500 dark:peer-checked:bg-zinc-800 dark:peer-checked:text-white">
                <Briefcase size={20} />
                <span>وسيط</span>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-bold text-muted-foreground">
            الاسم الكامل
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <User className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="الاسم الثلاثي"
              className="block w-full appearance-none rounded-xl border border-border bg-muted px-4 py-3 pr-10 text-foreground transition-colors placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-100 sm:text-sm font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="block w-full appearance-none rounded-xl border border-border bg-muted px-4 py-3 pr-10 text-foreground transition-colors placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-100 sm:text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-bold text-muted-foreground">
              رقم الهاتف
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Phone className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                dir="ltr"
                placeholder="01xxxxxxxxx"
                className="block w-full appearance-none rounded-xl border border-border bg-muted px-4 py-3 pr-10 text-left text-foreground transition-colors placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-100 sm:text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-muted-foreground">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Lock className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="block w-full appearance-none rounded-xl border border-border bg-muted px-4 py-3 pr-10 text-foreground transition-colors placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-100 sm:text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-muted-foreground">
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
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
                className="block w-full appearance-none rounded-xl border border-border bg-muted px-4 py-3 pr-10 text-foreground transition-colors placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-100 sm:text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-xl border border-transparent bg-zinc-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus:ring-zinc-100"
          >
            {isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" state={{ from: redirectPath }} className="font-bold text-foreground transition-colors hover:text-foreground">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
