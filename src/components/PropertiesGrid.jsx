import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import { SlidersHorizontal, SearchX } from 'lucide-react';

const PropertiesGrid = ({ properties, sortBy, setSortBy, onOpenFilters }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // إعادة تعيين الصفحة الأولى عند تغير الفلاتر
  useEffect(() => {
    setCurrentPage(1);
  }, [properties]);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " ج.م";
  };

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const currentProperties = properties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full">
      {/* الشريط العلوي */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground font-medium">
            تم العثور على <span className="font-bold text-foreground">{properties.length}</span> عقار
          </p>
          <button
            type="button"
            onClick={onOpenFilters}
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-accent hover:text-accent-foreground rounded-lg text-sm font-semibold text-muted-foreground transition-colors"
          >
            <SlidersHorizontal size={16} />
            فلاتر
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">الترتيب حسب:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-2 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-all text-sm font-medium appearance-none"
          >
            <option value="newest">الأحدث</option>
            <option value="price-asc">السعر: من الأقل للأعلى</option>
            <option value="price-desc">السعر: من الأعلى للأقل</option>
          </select>
        </div>
      </div>

      {/* شبكة العقارات أو حالة لا يوجد نتائج */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-card rounded-2xl border border-border text-center shadow-sm">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <SearchX size={32} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">لا توجد نتائج مطابقة</h2>
          <p className="text-muted-foreground font-medium">عذراً، لم نتمكن من العثور على عقارات تطابق بحثك. يرجى تجربة تغيير الفلاتر للحصول على نتائج أكثر.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {currentProperties.map((prop) => (
            <PropertyCard 
              key={prop.id}
              id={prop.id}
              image={prop.image}
              price={formatPrice(prop.price)}
              region={`${prop.title} - ${prop.location}`}
              rooms={prop.bedrooms}
              baths={prop.bathrooms}
              area={prop.area}
              fullProperty={prop}
            />
          ))}
        </div>
      )}

      {/* الترقيم (Pagination) */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button 
              key={page}
              onClick={() => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all duration-300 ${
                currentPage === page 
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md scale-110' 
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border hover:text-foreground hover:border-zinc-900 dark:border-zinc-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesGrid;
