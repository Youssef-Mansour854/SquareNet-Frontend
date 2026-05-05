import React from 'react';
import { Search, UserPlus, Home } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'ابحث عن عقارك',
      description: 'استخدم محرك البحث المتقدم للعثور على العقار المناسب لك في أي منطقة بمصر.',
      icon: <Search size={32} className="text-primary" />
    },
    {
      id: 2,
      title: 'تواصل مع المالك',
      description: 'يمكنك التواصل مباشرة مع مالك العقار أو الوكيل العقاري بكل سهولة وأمان.',
      icon: <UserPlus size={32} className="text-primary" />
    },
    {
      id: 3,
      title: 'احصل على المفتاح',
      description: 'أتمم إجراءات الشراء أو الإيجار واستلم مفتاح منزلك الجديد بكل اطمئنان.',
      icon: <Home size={32} className="text-primary" />
    }
  ];

  return (
    <section className="py-24 px-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            كيف يعمل الموقع؟
          </h2>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            خطوات بسيطة وسريعة تفصلك عن منزل أحلامك، ابدأ رحلتك الآن.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -z-10"></div>

          {steps.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center text-center group">
              {/* Step number badge */}
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {step.id}
              </div>

              {/* Icon container */}
              <div className="w-24 h-24 rounded-full bg-white dark:bg-zinc-900 border-4 border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500 z-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
