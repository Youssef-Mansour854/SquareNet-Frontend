import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FilterSidebar from '../components/FilterSidebar';
import PropertiesGrid from '../components/PropertiesGrid';
import { useProperties } from '../context/PropertiesContext';

const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const incomingSearchTerm = searchParams.get('search') || '';
  const incomingTypes = searchParams.get('types') ? searchParams.get('types').split(',') : [];
  const incomingMaxPrice = searchParams.get('maxPrice') || '';
  const incomingLocation = searchParams.get('location') || '';
  const { properties: propertiesData, fetchProperties } = useProperties();

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const [searchTerm, setSearchTerm] = useState(incomingSearchTerm);
  const [selectedLocation, setSelectedLocation] = useState(incomingLocation);
  const [selectedTypes, setSelectedTypes] = useState(incomingTypes);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState(incomingMaxPrice);
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');
  const [selectedBathrooms, setSelectedBathrooms] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(incomingSearchTerm);
    if (incomingLocation) setSelectedLocation(incomingLocation);
    if (incomingTypes.length > 0) setSelectedTypes(incomingTypes);
    if (incomingMaxPrice) setMaxPrice(incomingMaxPrice);
  }, [incomingSearchTerm, incomingLocation, incomingMaxPrice]);

  const clearFilters = () => {
    setSearchTerm(incomingSearchTerm);
    setSelectedLocation('');
    setSelectedTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setSelectedBedrooms('');
    setSelectedBathrooms('');
  };

  useEffect(() => {
    // Construct query string for backend API
    const params = new URLSearchParams();
    if (searchTerm) params.append('keyword', searchTerm);
    if (selectedLocation) params.append('location', selectedLocation);
    if (selectedTypes.length > 0) params.append('types', selectedTypes.join(','));
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (minArea) params.append('minArea', minArea);
    if (maxArea) params.append('maxArea', maxArea);
    
    if (selectedBedrooms) {
      if (selectedBedrooms === '+5') {
         params.append('minBedrooms', '5');
      } else {
         params.append('bedrooms', selectedBedrooms);
      }
    }

    if (selectedBathrooms) {
      if (selectedBathrooms === '+4') {
         params.append('minBathrooms', '4');
      } else {
         params.append('bathrooms', selectedBathrooms);
      }
    }

    // Sort mapping
    if (sortBy === 'price-asc') params.append('sort', 'price');
    if (sortBy === 'price-desc') params.append('sort', '-price');
    if (sortBy === 'newest') params.append('sort', '-dateAdded,-createdAt');

    // Fetch from backend
    fetchProperties(params.toString());
  }, [
    searchTerm, selectedLocation, selectedTypes, minPrice, maxPrice, 
    minArea, maxArea, selectedBedrooms, selectedBathrooms, sortBy, fetchProperties
  ]);

  const filteredProperties = propertiesData; // Now it comes filtered from backend!

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground font-sans transition-colors duration-300 flex flex-col" dir="rtl">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            تصفح العقارات
          </h1>
          <p className="text-muted-foreground font-medium">
            استكشف مجموعة واسعة من أرقى العقارات المتاحة
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block w-3/12 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                minArea={minArea}
                setMinArea={setMinArea}
                maxArea={maxArea}
                setMaxArea={setMaxArea}
                selectedBedrooms={selectedBedrooms}
                setSelectedBedrooms={setSelectedBedrooms}
                selectedBathrooms={selectedBathrooms}
                setSelectedBathrooms={setSelectedBathrooms}
                clearFilters={clearFilters}
              />
            </div>
          </div>

          <div className="w-full lg:w-9/12">
            <PropertiesGrid
              properties={filteredProperties}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onOpenFilters={() => setMobileFiltersOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-[80]">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/50"
            aria-label="إغلاق الفلاتر"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl bg-background border-t border-border shadow-2xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-extrabold">الفلاتر</h3>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-accent transition-colors font-bold text-sm"
                >
                  تم
                </button>
              </div>
              <FilterSidebar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                minArea={minArea}
                setMinArea={setMinArea}
                maxArea={maxArea}
                setMaxArea={setMaxArea}
                selectedBedrooms={selectedBedrooms}
                setSelectedBedrooms={setSelectedBedrooms}
                selectedBathrooms={selectedBathrooms}
                setSelectedBathrooms={setSelectedBathrooms}
                clearFilters={clearFilters}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertiesPage;
