import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import authBg from '../assets/images/apartment-1-bg.jpg';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex text-foreground bg-background transition-colors duration-300" dir="rtl">
      
      {/* النصف الأول: الجانب الوظيفي (نموذج الإدخال) */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-5/12 relative py-20 lg:py-0">
        
        {/* زر العودة للرئيسية */}
        <div className="absolute top-6 right-6 lg:top-8 lg:right-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-colors font-bold text-sm">
            <ArrowRight size={18} />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          {/* اللوجو للموبايل (يظهر فقط في الشاشات الصغيرة) */}
          <div className="lg:hidden flex justify-center mb-8">
            <img 
              src="/logo/IMG-20260511-WA0082.jpg" 
              alt="Square Net" 
              className="h-12 w-auto object-contain dark:hidden"
            />
            <img 
              src="/logo/IMG-20260511-WA0083.jpg" 
              alt="Square Net" 
              className="h-12 w-auto object-contain hidden dark:block"
            />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>

      {/* النصف الثاني: الجانب الجمالي (صورة الخلفية) - يختفي في الشاشات الصغيرة */}
      <div className="hidden lg:block relative w-full lg:w-1/2 xl:w-7/12">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${authBg})` }}
        ></div>
        
        {/* طبقة التعتيم */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/75"></div>
        
        {/* المحتوى فوق الصورة */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo/IMG-20260511-WA0083.jpg" 
              alt="Square Net" 
              className="h-20 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <p className="text-xl text-zinc-200 font-medium max-w-md drop-shadow-md">
            بوابتك الأولى لاكتشاف أرقى العقارات بكل سهولة وأمان.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
