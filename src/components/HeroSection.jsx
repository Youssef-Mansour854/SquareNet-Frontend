import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Search, MapPin, Home as HomeIcon, Banknote, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/images/villa-1-bg.jpg';
import { useProperties } from '../context/PropertiesContext';

const HeroSection = () => {
  const navigate = useNavigate();
  const { properties: propertiesData } = useProperties();

  // Advanced Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Dropdown UI State
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  const typeDropdownRef = useRef(null);
  const priceDropdownRef = useRef(null);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedSearch) return [];

    return propertiesData
      .filter((property) => {
        const title = property.title.toLowerCase();
        const location = property.location.toLowerCase();

        return (
          title.includes(normalizedSearch) || location.includes(normalizedSearch)
        );
      })
      .slice(0, 5);
  }, [normalizedSearch, propertiesData]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeOpen(false);
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        setIsPriceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedType) params.append('types', selectedType);
    if (maxPrice) params.append('maxPrice', maxPrice);

    navigate(`/properties?${params.toString()}`);
  };

  const propertyTypes = ['شقة', 'فيلا', 'تاون هاوس', 'تجاري'];
  
  const pricePresets = [
    { label: '1,000,000 ج.م', value: '1000000' },
    { label: '3,000,000 ج.م', value: '3000000' },
    { label: '5,000,000 ج.م', value: '5000000' },
    { label: '10,000,000 ج.م', value: '10000000' },
    { label: '20,000,000 ج.م', value: '20000000' },
  ];

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-76px)] px-4 text-center">
      {/* Background Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
      </div>

      <div className="relative z-20 w-full max-w-5xl flex flex-col items-center mt-12 mb-20">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
          اكتشف أفضل العقارات في مصر
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg leading-tight">
          منزل أحلامك <br className="hidden md:block" />
          أصبح في متناول <span className="text-primary">يديك</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-300 mb-12 max-w-2xl font-medium drop-shadow-md">
          ابحث في أضخم قاعدة بيانات للعقارات الموثوقة. نوفر لك اختيارات متنوعة تناسب ذوقك وميزانيتك بكل سهولة وشفافية.
        </p>

        {/* Advanced Search Bar */}
        <div className="w-full relative z-20">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl md:rounded-full shadow-2xl p-3 border border-white/20 dark:border-zinc-800 transition-all duration-300 gap-3 md:gap-0"
          >
            {/* Location / Keyword */}
            <div className="flex-1 flex items-center px-4 py-2 md:border-l border-zinc-200 dark:border-zinc-800">
              <MapPin className="text-zinc-400 shrink-0 ml-3" size={20} />
              <div className="flex flex-col items-start w-full">
                <label className="text-xs font-bold text-zinc-500 mb-1">الموقع أو الكلمة المفتاحية</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="أين تبحث؟"
                  className="w-full bg-transparent text-foreground outline-none font-semibold placeholder:font-medium placeholder:text-zinc-400 text-sm"
                />
              </div>
            </div>

            {/* Property Type Custom Dropdown */}
            <div 
              ref={typeDropdownRef}
              className="flex-1 flex items-center px-4 py-2 md:border-l border-zinc-200 dark:border-zinc-800 relative cursor-pointer"
              onClick={() => setIsTypeOpen(!isTypeOpen)}
            >
              <HomeIcon className="text-zinc-400 shrink-0 ml-3" size={20} />
              <div className="flex flex-col items-start w-full">
                <label className="text-xs font-bold text-zinc-500 mb-1">نوع العقار</label>
                <div className="w-full flex items-center justify-between text-sm font-semibold text-foreground">
                  <span className={selectedType ? 'text-foreground' : 'text-zinc-400 font-medium'}>
                    {selectedType || 'جميع العقارات'}
                  </span>
                  <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {/* Type Dropdown Menu */}
              {isTypeOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-background border border-border rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-[100] py-2 text-right">
                  <div 
                    onClick={() => setSelectedType('')}
                    className={`px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${!selectedType ? 'text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/50' : 'text-zinc-600 dark:text-zinc-300'}`}
                  >
                    جميع العقارات
                  </div>
                  {propertyTypes.map((type) => (
                    <div 
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${selectedType === type ? 'text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/50' : 'text-zinc-600 dark:text-zinc-300'}`}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Combobox */}
            <div 
              ref={priceDropdownRef}
              className="flex-1 flex items-center px-4 py-2 relative"
            >
              <Banknote className="text-zinc-400 shrink-0 ml-3" size={20} />
              <div className="flex flex-col items-start w-full">
                <label className="text-xs font-bold text-zinc-500 mb-1">الحد الأقصى للسعر</label>
                <div className="w-full flex items-center justify-between">
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onFocus={() => setIsPriceOpen(true)}
                    placeholder="أي سعر"
                    className="w-full bg-transparent text-foreground outline-none font-semibold text-sm placeholder:font-medium placeholder:text-zinc-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <ChevronDown 
                    size={16} 
                    className={`text-zinc-400 cursor-pointer transition-transform ${isPriceOpen ? 'rotate-180' : ''}`} 
                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                  />
                </div>
              </div>

              {/* Price Dropdown Menu */}
              {isPriceOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-background border border-border rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-[100] py-2 text-right">
                  <div 
                    onClick={() => { setMaxPrice(''); setIsPriceOpen(false); }}
                    className={`px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${!maxPrice ? 'text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/50' : 'text-zinc-600 dark:text-zinc-300'}`}
                  >
                    أي سعر
                  </div>
                  {pricePresets.map((preset) => (
                    <div 
                      key={preset.value}
                      onClick={() => { setMaxPrice(preset.value); setIsPriceOpen(false); }}
                      className={`px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${maxPrice === preset.value ? 'text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/50' : 'text-zinc-600 dark:text-zinc-300'}`}
                    >
                      {preset.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="md:w-32 shrink-0 mt-2 md:mt-0 mr-2">
              <button
                type="submit"
                className="w-full h-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-4 md:py-0 rounded-2xl md:rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                <Search size={20} />
                <span className="md:hidden">بحث الآن</span>
              </button>
            </div>
          </form>

          {/* Autocomplete Suggestions */}
          {normalizedSearch && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-4 mx-4 md:mx-10 overflow-hidden rounded-3xl border border-white/20 bg-white/95 text-right shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 z-40">
              <div className="border-b border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                نتائج سريعة
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {suggestions.map((property) => (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right transition-colors hover:bg-muted/70"
                  >
                    <div>
                      <div className="font-bold text-foreground">
                        {property.title}
                      </div>
                      <div className="mt-1 text-sm font-medium text-muted-foreground">
                        {property.location}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-bold text-foreground">
                      {property.price.toLocaleString('en-US')} ج.م
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-zinc-100 px-5 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                عرض كل النتائج
              </button>
            </div>
          )}
        </div>
      </div>
      
      
      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;
