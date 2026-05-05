import React from 'react';
import { Users, Search, ShieldCheck } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Users size={36} className="text-foreground" />,
      title: "وساطة عقارية مباشرة",
      subtext: "اربط مباشرة مع البائعين والمشترين"
    },
    {
      icon: <Search size={36} className="text-foreground" />,
      title: "تقييم عقاري دقيق",
      subtext: "تقييمات موثوقة لعقاراتك"
    },
    {
      icon: <ShieldCheck size={36} className="text-foreground" />,
      title: "معاملات آمنة ومحمية",
      subtext: "إجراءات قانونية مبسطة"
    }
  ];

  return (
    <section className="py-24 px-4 bg-muted/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
            ماذا تقدم Square Net
          </h2>
          <div className="w-20 h-1.5 bg-zinc-900 dark:bg-zinc-100 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card border border-border p-10 rounded-3xl shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300 text-center flex flex-col items-center group"
            >
              <div className="w-20 h-20 bg-muted dark:bg-zinc-900/10 dark:bg-zinc-100/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-transparent dark:border-zinc-900 dark:border-zinc-100/20">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-medium">
                {feature.subtext}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
