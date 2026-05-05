import PropertyCard from './PropertyCard';
import { useProperties } from '../context/PropertiesContext';

const FeaturedProperties = () => {
  const { properties: propertiesData } = useProperties();
  // استخدام أول 6 عقارات من البيانات العامة
  const properties = propertiesData.slice(0, 6);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " ج.م";
  };

  return (
    <section className="py-24 px-4 md:px-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
            أحدث العقارات المضافة
          </h2>
          <div className="w-20 h-1.5 bg-zinc-900 dark:bg-zinc-100 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <PropertyCard 
              key={prop.id}
              id={prop.id}
              image={prop.image}
              price={formatPrice(prop.price)}
              region={prop.title + " - " + prop.location}
              rooms={prop.bedrooms}
              baths={prop.bathrooms}
              area={prop.area}
              fullProperty={prop}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
