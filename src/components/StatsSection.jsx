import React from 'react';
import { Building2, Users, MapPin, Award } from 'lucide-react';
import { useProperties } from '../context/PropertiesContext';

const StatsSection = () => {
  const { properties } = useProperties();

  // Basic dynamic stats
  const totalProperties = properties.length > 500 ? properties.length : 500 + properties.length;
  
  // Calculate unique locations
  const uniqueLocations = new Set(properties.map(p => p.location)).size;
  const displayLocations = uniqueLocations > 50 ? uniqueLocations : 50 + uniqueLocations;

  const stats = [
    {
      id: 1,
      title: 'عقار متاح',
      value: `+${totalProperties}`,
      icon: <Building2 size={32} className="text-primary-foreground" />
    },
    {
      id: 2,
      title: 'عميل سعيد',
      value: '+10k',
      icon: <Users size={32} className="text-primary-foreground" />
    },
    {
      id: 3,
      title: 'مدينة ومنطقة',
      value: `+${displayLocations}`,
      icon: <MapPin size={32} className="text-primary-foreground" />
    },
    {
      id: 4,
      title: 'سنوات خبرة',
      value: '+15',
      icon: <Award size={32} className="text-primary-foreground" />
    }
  ];

  return (
    <section className="relative py-20 bg-primary overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x divide-x-reverse divide-primary-foreground/20">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center justify-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner">
                {stat.icon}
              </div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-2 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-primary-foreground/80 font-bold text-lg">
                {stat.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
