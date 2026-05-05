import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useProperties } from '../context/PropertiesContext';

const FilterSidebar = ({
  searchTerm, setSearchTerm,
  selectedLocation, setSelectedLocation,
  selectedTypes, setSelectedTypes,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  minArea, setMinArea,
  maxArea, setMaxArea,
  selectedBedrooms, setSelectedBedrooms,
  selectedBathrooms, setSelectedBathrooms,
  clearFilters
}) => {

  const { properties } = useProperties();

  const availableLocations = useMemo(() => {
    const locations = properties.map(p => p.location);
    return [...new Set(locations)].sort();
  }, [properties]);

  const handleTypeChange = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-foreground">تصفية النتائج</h3>
        <button 
          onClick={clearFilters}
          className="text-sm font-semibold text-zinc-500 hover:text-foreground transition-colors"
        >
          إعادة ضبط
        </button>
      </div>

      <div className="space-y-6">
        {/* بحث نصي */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2">البحث</label>
          <div className="relative">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو المنطقة..." 
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-3 px-4 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-all text-sm font-medium"
            />
            <Search size={16} className="absolute left-4 top-3.5 text-zinc-400" />
          </div>
        </div>

        {/* المنطقة */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2">المنطقة</label>
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-all text-sm font-medium appearance-none"
          >
            <option value="">جميع المناطق</option>
            {availableLocations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* نوع العقار */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2">نوع العقار</label>
          <div className="flex flex-col gap-2">
            {['شقة', 'فيلا', 'تاون هاوس', 'تجاري'].map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeChange(type)}
                  className="w-4 h-4 rounded border-zinc-300 text-foreground focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-900" 
                />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* السعر */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2">السعر (ج.م)</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="من" 
              className="w-1/2 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-2 px-3 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-all text-sm font-medium" 
            />
            <input 
              type="number" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="إلى" 
              className="w-1/2 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-2 px-3 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-all text-sm font-medium" 
            />
          </div>
        </div>

        {/* المساحة */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2">المساحة (م٢)</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              placeholder="من" 
              className="w-1/2 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-2 px-3 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-all text-sm font-medium" 
            />
            <input 
              type="number" 
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value)}
              placeholder="إلى" 
              className="w-1/2 bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-2 px-3 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:border-zinc-100 transition-all text-sm font-medium" 
            />
          </div>
        </div>

        {/* عدد الغرف */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2">عدد الغرف</label>
          <div className="flex flex-wrap gap-2">
            {['1', '2', '3', '4', '+5'].map((num) => (
              <button 
                key={num} 
                onClick={() => setSelectedBedrooms(selectedBedrooms === num ? '' : num)}
                className={`w-10 h-10 rounded-lg border font-bold text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all
                  ${selectedBedrooms === num 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100' 
                    : 'border-border bg-muted text-muted-foreground hover:border-zinc-900 dark:border-zinc-100 hover:text-foreground dark:hover:bg-zinc-900/10 dark:bg-zinc-100/10'
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* عدد الحمامات */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2">عدد الحمامات</label>
          <div className="flex flex-wrap gap-2">
            {['1', '2', '3', '+4'].map((num) => (
              <button 
                key={num} 
                onClick={() => setSelectedBathrooms(selectedBathrooms === num ? '' : num)}
                className={`w-10 h-10 rounded-lg border font-bold text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all
                  ${selectedBathrooms === num 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100' 
                    : 'border-border bg-muted text-muted-foreground hover:border-zinc-900 dark:border-zinc-100 hover:text-foreground dark:hover:bg-zinc-900/10 dark:bg-zinc-100/10'
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilterSidebar;
