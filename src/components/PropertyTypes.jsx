import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertiesContext';
import { Building, Home, Map, Briefcase } from 'lucide-react';
import apartmentImg from '../assets/images/apartment-1.jpg';
import villaImg from '../assets/images/villa-1.jpg';
import townhouseImg from '../assets/images/townhouse-1.jpg';
import commercialImg from '../assets/images/office-1.jpg';

const PropertyTypes = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();

  // Calculate dynamic counts
  const counts = useMemo(() => {
    return properties.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});
  }, [properties]);

  const propertyTypes = [
    {
      id: 'شقة',
      title: 'شقق سكنية',
      type: 'شقة',
      icon: <Building size={24} className="text-white" />,
      image: apartmentImg,
    },
    {
      id: 'فيلا',
      title: 'فيلات فاخرة',
      type: 'فيلا',
      icon: <Home size={24} className="text-white" />,
      image: villaImg,
    },
    {
      id: 'تاون هاوس',
      title: 'تاون هاوس',
      type: 'تاون هاوس',
      icon: <Map size={24} className="text-white" />,
      image: townhouseImg,
    },
    {
      id: 'تجاري',
      title: 'عقارات تجارية',
      type: 'تجاري',
      icon: <Briefcase size={24} className="text-white" />,
      image: commercialImg,
    }
  ];

  const handleNavigate = (type) => {
    navigate(`/properties?types=${type}`);
  };

  return (
    <section className="py-24 px-4 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              استكشف حسب نوع العقار
            </h2>
            <p className="text-muted-foreground text-lg font-medium max-w-2xl">
              تصفح مجموعة متنوعة من العقارات المتاحة لدينا واختر ما يناسب تطلعاتك من الشقق، الفيلات، وحتى المساحات التجارية.
            </p>
          </div>
          <div className="hidden md:block w-20 h-1.5 bg-primary rounded-full shrink-0"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {propertyTypes.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavigate(item.type)}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              ></div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 transform group-hover:-translate-y-2 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 transform group-hover:-translate-y-1 transition-transform duration-300">
                  {item.title}
                </h3>
                <p className="text-zinc-300 font-medium transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {counts[item.type] || 0} عقار متاح
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyTypes;
