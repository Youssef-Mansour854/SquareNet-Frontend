import { useState } from 'react';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import fallbackImg from '../assets/images/villa-1.jpg';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import AuthPromptModal from './AuthPromptModal';

const PropertyCard = ({ id, image, price, region, rooms, baths, area, fullProperty }) => {
  const location = useLocation();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const isFav = isFavorite(id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    const propertyObj = fullProperty || {
      id,
      image,
      price,
      title: region.split('-')[0].trim(),
      location: region.split('-')[1]?.trim(),
      bedrooms: rooms,
      bathrooms: baths,
      area,
    };

    if (isFav) {
      removeFromFavorites(id);
    } else {
      addToFavorites(propertyObj);
    }
  };

  return (
    <>
      <Link to={`/property/${id}`} className="block bg-card rounded-2xl overflow-hidden shadow-md dark:shadow-none hover:shadow-xl dark:border dark:border-zinc-800 border border-transparent hover:border-zinc-900 dark:border-zinc-100 dark:hover:border-zinc-900 dark:border-zinc-100 transition-all duration-300 flex flex-col group cursor-pointer">
        <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden">
          <img
            src={image || fallbackImg}
            alt="صورة العقار"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-4 left-4 p-2 backdrop-blur-md rounded-full transition-all duration-300 shadow-sm z-10 group/btn ${
              isFav
                ? 'bg-card text-foreground'
                : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-400 hover:text-foreground hover:bg-white dark:hover:bg-zinc-900'
            }`}
            aria-label={isAuthenticated ? 'Toggle favorite' : 'Login to use favorites'}
          >
            <Heart
              size={18}
              className={`${isFav ? 'fill-foreground text-foreground' : 'fill-transparent group-hover/btn:fill-foreground transition-colors'}`}
            />
          </button>
          <div className="absolute top-4 right-4 bg-background/95 border-b border-border backdrop-blur-sm px-4 py-1.5 rounded-full text-foreground font-bold tracking-wide shadow-sm text-sm">
            {price}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200 mb-3">
            <MapPin size={20} className="text-foreground shrink-0" />
            <span className="text-lg font-bold truncate">{region}</span>
          </div>

          <div className="flex flex-col gap-2 text-muted-foreground text-sm mb-6 mt-auto">
            <div className="flex items-center gap-2">
              <Square size={16} className="text-foreground" />
              <span className="font-medium">{area} م²</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Bed size={16} className="text-foreground" />
                <span className="font-medium">{rooms} غرف نوم</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath size={16} className="text-foreground" />
                <span className="font-medium">{baths} حمامات</span>
              </div>
            </div>
          </div>

          <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-all duration-300 shadow-sm">
            عرض التفاصيل
          </button>
        </div>
      </Link>

      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        redirectTo={location.pathname}
      />
    </>
  );
};

export default PropertyCard;
