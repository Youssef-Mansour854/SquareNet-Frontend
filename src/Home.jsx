import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturedProperties from './components/FeaturedProperties';
import Footer from './components/Footer';
import CallToAction from './components/CallToAction';
import FeaturesSection from './components/FeaturesSection';
import PropertyTypes from './components/PropertyTypes';
import HowItWorks from './components/HowItWorks';
import StatsSection from './components/StatsSection';

const Home = () => {
  // منطق حفظ وتغيير حالة الـ Dark/Light Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // التحقق من الإعدادات المحفوظة مسبقاً في المتصفح
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
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

  return (
    <div 
      className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300" 
      dir="rtl"
    >
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main>
        <HeroSection />
        <PropertyTypes />
        <HowItWorks />
        <FeaturedProperties />
        <StatsSection />
        <FeaturesSection />
        <CallToAction />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
