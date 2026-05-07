import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertiesContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Bed, Bath, Square, ArrowRight, Heart, Share2, Phone, Mail, Star, MessageSquare, X, ChevronRight, ChevronLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://squarenet-backend-production.up.railway.app';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { properties: propertiesData, incrementPropertyView, propertyViews } = useProperties();
  const { isAuthenticated, token, currentUser } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const navigate = useNavigate();

  const allImages = React.useMemo(() => {
    if (!property) return [];
    const images = [];
    if (property.image) images.push(property.image);
    if (property.gallery && property.gallery.length > 0) {
      property.gallery.forEach(img => {
        if (!images.includes(img)) images.push(img);
      });
    }
    return images;
  }, [property]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      // In RTL, Right Arrow means Previous, Left Arrow means Next
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allImages.length]);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch reviews for current property
  const fetchReviews = async (propId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reviews?propertyId=${propId}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...reviewForm,
          propertyId: property.id || property._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccess(true);
        setReviewForm({ rating: 5, comment: '' });
        fetchReviews(property.id || property._id);
      } else {
        setReviewError(data.message || 'حدث خطأ أثناء إرسال التقييم');
      }
    } catch {
      setReviewError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews(property.id || property._id);
    } catch (err) {
      console.error('Failed to delete review', err);
    }
  };

  // Theme logic
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
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

  const viewIncremented = useRef(false);

  useEffect(() => {
    // Support both numeric IDs (old static) and string IDs (from API)
    const foundProperty = propertiesData.find(p => 
      String(p.id) === String(id) || String(p._id) === String(id)
    );
    
    if (foundProperty) {
      setProperty(foundProperty);
      setActiveImage(foundProperty?.gallery?.[0] || foundProperty?.image || '');
      setLoading(false);

      if (!viewIncremented.current) {
        incrementPropertyView(foundProperty.id || foundProperty._id);
        viewIncremented.current = true;
      }

      fetchReviews(foundProperty.id || foundProperty._id);
    } else {
      // Property not found in context, try API directly
      const fetchSingleProperty = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/properties/${id}`);
          const data = await res.json();
          if (res.ok && data.data) {
            const prop = data.data;
            setProperty(prop);
            setActiveImage(prop.gallery?.[0] || prop.images?.[0] || prop.image || '');
            fetchReviews(prop._id || prop.id);
          }
        } catch (err) {
          console.error('Failed to fetch property by ID:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSingleProperty();
    }
  }, [id, propertiesData, incrementPropertyView]);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " ج.م";
  };

  const hasExactCoordinates =
    typeof property?.latitude === 'number' && typeof property?.longitude === 'number';
  const mapQuery = hasExactCoordinates
    ? `${property.latitude},${property.longitude}`
    : `${property?.location || ''}, Egypt`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-16 h-16 border-4 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-foreground" dir="rtl">
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
            <MapPin size={40} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">عذراً، هذا العقار غير متوفر</h1>
          <p className="text-muted-foreground mb-8 max-w-md">يبدو أن الرابط الذي اتبعته غير صحيح أو قد تم حذف هذا العقار من قاعدة البيانات الخاصة بنا.</p>
          <Link to="/properties" className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full transition-all duration-300 shadow-md">
            العودة لتصفح العقارات
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground font-sans transition-colors duration-300 flex flex-col" dir="rtl">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {/* شريط التنقل العلوي للعودة */}
        <Link to="/properties" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-colors mb-6 font-semibold w-fit">
          <ArrowRight size={20} />
          العودة للنتائج
        </Link>

        {/* معرض الصور (مبسط) */}
        <div className="relative w-full h-[260px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden mb-6 sm:mb-8 shadow-lg group cursor-pointer"
             onClick={() => {
               const currentIndex = allImages.indexOf(activeImage || property.image);
               setLightboxIndex(currentIndex >= 0 ? currentIndex : 0);
               setLightboxOpen(true);
             }}
        >
          <img src={activeImage || property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute top-3 left-3 sm:top-6 sm:left-6 flex gap-2 sm:gap-3">
            <button className="p-2.5 sm:p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-colors shadow-sm">
              <Share2 size={20} />
            </button>
            <button className="p-2.5 sm:p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-colors shadow-sm">
              <Heart size={20} />
            </button>
          </div>
          <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6">
            <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-lg shadow-md text-xs sm:text-sm">
              {property.type}
            </span>
          </div>
        </div>

        {/* تفاصيل العقار السفلية */}
        {allImages.length > 1 ? (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {allImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => {
                  setActiveImage(image);
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
                className={`overflow-hidden rounded-2xl border transition ${
                  (activeImage || property.image) === image ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-950' : 'border-border opacity-70 hover:opacity-100'
                }`}
              >
                <img src={image} alt={`${property.title} ${index + 1}`} className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* الجانب الأيمن (المعلومات) */}
          <div className="w-full lg:w-8/12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 leading-tight">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground text-lg">
                  <MapPin size={20} className="text-foreground shrink-0" />
                  <span>{property.location}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-foreground font-bold">{propertyViews[property.id] || 1} مشاهدة</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-black text-foreground drop-shadow-sm flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 line-through mr-2">
                    {formatPrice(Math.floor(property.price * 1.1))}
                  </span>
                  {formatPrice(property.price)}
                </div>
                <div className="text-muted-foreground text-sm mt-1 font-medium">تمت الإضافة: {property.dateAdded ? new Date(property.dateAdded).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد'}</div>
              </div>
            </div>

            {/* الخصائص الأساسية */}
            <div className="flex flex-wrap items-center gap-6 py-6 border-y border-border mb-8 bg-zinc-100/50 dark:bg-zinc-900/50 px-6 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 dark:bg-zinc-900/10 dark:bg-zinc-100/10 flex items-center justify-center">
                  <Square size={24} className="text-foreground dark:text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium whitespace-nowrap">المساحة</p>
                  <p className="text-lg font-bold text-foreground">{property.area} م٢</p>
                </div>
              </div>
              <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 dark:bg-zinc-900/10 dark:bg-zinc-100/10 flex items-center justify-center">
                  <Bed size={24} className="text-foreground dark:text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium whitespace-nowrap">غرف النوم</p>
                  <p className="text-lg font-bold text-foreground">{property.bedrooms}</p>
                </div>
              </div>
              <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 dark:bg-zinc-900/10 dark:bg-zinc-100/10 flex items-center justify-center">
                  <Bath size={24} className="text-foreground dark:text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium whitespace-nowrap">الحمامات</p>
                  <p className="text-lg font-bold text-foreground">{property.bathrooms}</p>
                </div>
              </div>
            </div>

            {/* الوصف */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                <div className="w-1.5 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-full"></div>
                وصف العقار
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {property.description}
                <br /><br />
                يعتبر هذا العقار فرصة ممتازة للباحثين عن الرقي والتميز في أهم مناطق السكن والاستثمار. تم اختيار التشطيبات بعناية فائقة لضمان أعلى درجات الفخامة مع الاهتمام بأدق التفاصيل المعمارية والهندسية التي توفر أقصى استغلال للمساحات واستمتاع بالتهوية الطبيعية والإضاءة.
              </p>
            </div>

            {/* الموقع على الخريطة */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                <div className="w-1.5 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-full"></div>
                الموقع على الخريطة
              </h2>
              <div className="w-full h-[240px] sm:h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-border shadow-sm">
                <iframe
                  title="موقع العقار"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
              {hasExactCoordinates ? (
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  الموقع الدقيق محفوظ على الخريطة: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                </p>
              ) : null}
            </div>

            {/* قسم التقييمات */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                <div className="w-1.5 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-full"></div>
                التقييمات والمراجعات
                {reviews.length > 0 && (
                  <span className="text-sm font-medium text-muted-foreground">({reviews.length} تقييم)</span>
                )}
              </h2>

              {/* ملخص التقييم */}
              {property.ratingsAverage > 0 && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl">
                  <div className="text-center">
                    <div className="text-4xl font-black text-foreground">{property.ratingsAverage}</div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={16} className={s <= Math.round(property.ratingsAverage) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-300 dark:text-zinc-600'} />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">{property.ratingsQuantity} تقييم</div>
                  </div>
                </div>
              )}

              {/* نموذج إضافة تقييم */}
              {isAuthenticated ? (
                <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare size={18} />
                    أضف تقييمك
                  </h4>
                  {reviewSuccess ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-4 py-4 text-center">
                      <p className="text-green-700 dark:text-green-400 font-bold">شكراً لك! تم إضافة تقييمك بنجاح ✨</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {reviewError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                          {reviewError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-2">التقييم</label>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewForm(prev => ({...prev, rating: s}))}
                              className="p-1 transition-transform hover:scale-125"
                            >
                              <Star size={28} className={s <= reviewForm.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-300 dark:text-zinc-600'} />
                            </button>
                          ))}
                          <span className="text-sm font-bold text-muted-foreground mr-2">{reviewForm.rating}/5</span>
                        </div>
                      </div>
                      <div>
                        <textarea
                          placeholder="شاركنا تجربتك مع هذا العقار..."
                          required
                          rows={3}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm(prev => ({...prev, comment: e.target.value}))}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-border rounded-xl py-3 px-4 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm font-medium resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={reviewLoading}
                        className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm disabled:opacity-60"
                      >
                        {reviewLoading ? 'جاري الإرسال...' : 'إرسال التقييم'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-border rounded-2xl p-5 mb-6 text-center">
                  <p className="text-muted-foreground text-sm font-medium">
                    <Link to="/login" className="font-bold text-foreground hover:underline">سجّل دخولك</Link> لتتمكن من إضافة تقييم
                  </p>
                </div>
              )}

              {/* قائمة التقييمات */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-card border border-border rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden border-2 border-border">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'User')}&background=27272a&color=ffffff&size=40`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{review.user?.name || 'مستخدم'}</p>
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-300 dark:text-zinc-600'} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>

                      {/* Delete button for review owner */}
                      {currentUser && (currentUser._id === review.user?._id || currentUser.id === review.user?._id) && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="mt-3 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                        >
                          حذف التقييم
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-6">لا توجد تقييمات بعد. كن أول من يقيّم هذا العقار!</p>
              )}
            </div>
          </div>

          {/* الجانب الأيسر (نموذج التواصل مع المالك) */}
          <div className="w-full lg:w-4/12">
            <div className="sticky top-24 bg-card p-6 rounded-3xl border border-border shadow-md">
              <h3 className="text-xl font-bold mb-6 text-foreground text-center">تواصل مع المالك</h3>
              <div className="w-24 h-24 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border-4 border-border mb-4">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(property.listedBy || 'Square Net')}&background=27272a&color=ffffff&size=100`} alt="Agent" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-1 text-center">{property.listedBy || 'فريق Square Net'}</h4>
              <p className="text-muted-foreground font-medium mb-6 text-center text-sm">وكيل عقاري معتمد</p>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    const targetOwnerId = property.ownerId || property.user?._id || property.owner?._id || null;
                    if (targetOwnerId) {
                      navigate('/chat', { state: { ownerId: targetOwnerId, propertyId: property.id || property._id } });
                    } else {
                      alert('عذراً، لا يمكننا تحديد حساب المالك في الوقت الحالي');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <MessageSquare size={18} />
                  محادثة مباشرة مع المالك
                </button>
              </div>

              {property.contactPhone && (
                <div className="mt-4">
                  <a
                    href={`tel:${property.contactPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-foreground font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Phone size={18} />
                    {property.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Full-Screen Image Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            className="absolute top-6 left-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            aria-label="إغلاق"
          >
            <X size={28} />
          </button>
          
          {/* Previous Arrow (Right side in RTL) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
            }}
            className="absolute right-4 sm:right-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            aria-label="الصورة السابقة"
          >
            <ChevronRight size={32} />
          </button>
          
          {/* The Image */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4 sm:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={allImages[lightboxIndex]} 
              className="max-w-full max-h-full object-contain select-none shadow-2xl rounded-lg"
              alt="صورة العقار مكبرة"
            />
            <div className="absolute bottom-6 sm:bottom-10 bg-black/50 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md border border-white/10">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          </div>

          {/* Next Arrow (Left side in RTL) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
            }}
            className="absolute left-4 sm:left-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            aria-label="الصورة التالية"
          >
            <ChevronLeft size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;
