import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LocationPickerMap from '../components/LocationPickerMap';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertiesContext';
import { ImagePlus, MapPin, Building, Banknote, ShieldCheck, Images, X } from 'lucide-react';

const MAX_ADDITIONAL_IMAGES = 10;

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addProperty } = useProperties();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });
  const [formData, setFormData] = useState({
    title: '',
    type: 'شقة',
    location: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
  });
  const [mainImageFile, setMainImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  useEffect(() => {
    if (!currentUser || currentUser.accountType !== 'owner') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const mainImagePreview = useMemo(
    () => (mainImageFile ? URL.createObjectURL(mainImageFile) : ''),
    [mainImageFile]
  );

  const additionalImagePreviews = useMemo(
    () =>
      additionalImageFiles.map((file) => ({
        name: file.name,
        preview: URL.createObjectURL(file),
      })),
    [additionalImageFiles]
  );

  useEffect(() => {
    return () => {
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
      }
      additionalImagePreviews.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [mainImagePreview, additionalImagePreviews]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setMainImageFile(file);
  };

  const handleAdditionalImagesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    const nextFiles = [...additionalImageFiles, ...selectedFiles].slice(0, MAX_ADDITIONAL_IMAGES);
    setAdditionalImageFiles(nextFiles);

    if (selectedFiles.length + additionalImageFiles.length > MAX_ADDITIONAL_IMAGES) {
      setErrorMsg(`يمكنك رفع ${MAX_ADDITIONAL_IMAGES} صور إضافية كحد أقصى.`);
    }

    event.target.value = '';
  };

  const removeAdditionalImage = (fileName) => {
    setAdditionalImageFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!mainImageFile) {
      setErrorMsg('الرجاء إضافة صورة رئيسية للعقار.');
      return;
    }

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('type', formData.type);
    payload.append('location', formData.location);
    payload.append('price', formData.price);
    payload.append('area', formData.area);
    payload.append('bedrooms', formData.bedrooms || '0');
    payload.append('bathrooms', formData.bathrooms || '0');
    payload.append('description', formData.description);
    payload.append('image', mainImageFile);
    if (selectedCoordinates) {
      payload.append('latitude', String(selectedCoordinates.lat));
      payload.append('longitude', String(selectedCoordinates.lng));
    }

    additionalImageFiles.forEach((file) => {
      payload.append('images', file);
    });

    setIsSubmitting(true);
    const result = await addProperty(payload);
    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMsg(result.message);
      return;
    }

    setSuccessMsg('تم إضافة العقار بنجاح! سيتم تحويلك إلى لوحة التحكم...');
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300" dir="rtl">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="mx-auto flex-grow w-full max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold">إضافة عقار جديد</h1>
            <p className="text-muted-foreground">ارفع صورة رئيسية وحتى 10 صور إضافية للعقار</p>
          </div>
          <Link to="/dashboard" className="rounded-lg bg-zinc-200 px-4 py-2 font-semibold text-foreground transition hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700">
            عودة للوحة التحكم
          </Link>
        </div>

        {successMsg ? (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-100 p-4 font-bold text-green-800">
            <ShieldCheck size={20} />
            {successMsg}
          </div>
        ) : null}

        {errorMsg ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
            {errorMsg}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-border bg-card p-6 shadow-lg md:p-10">
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-bold text-muted-foreground">الصورة الرئيسية *</label>
              <div className="group relative flex min-h-56 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-muted/50 p-6 transition-colors hover:bg-muted dark:border-zinc-700">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                {mainImagePreview ? (
                  <img src={mainImagePreview} alt="Main preview" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <ImagePlus size={40} className="transition-transform duration-300 group-hover:scale-110" />
                    <p className="text-sm font-semibold">اضغط لاختيار الصورة الرئيسية</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold text-muted-foreground">
                صور إضافية
                <span className="mr-2 text-xs font-medium">حتى {MAX_ADDITIONAL_IMAGES} صور</span>
              </label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-4 py-4 text-sm font-bold text-foreground transition hover:bg-zinc-200 dark:hover:bg-zinc-800">
                <Images size={18} />
                اختر صورًا إضافية
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  className="hidden"
                />
              </label>

              {additionalImagePreviews.length ? (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {additionalImagePreviews.map((image) => (
                    <div key={image.name} className="relative overflow-hidden rounded-2xl border border-border bg-muted">
                      <img src={image.preview} alt={image.name} className="h-32 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(image.name)}
                        className="absolute left-2 top-2 rounded-full bg-black/70 p-1 text-white transition hover:bg-black"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-muted-foreground">عنوان العقار *</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                type="text"
                placeholder="مثال: شقة على البحر"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-muted-foreground">نوع العقار *</label>
              <div className="relative">
                <Building className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-xl border border-border bg-muted py-3 pl-4 pr-10 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="شقة">شقة</option>
                  <option value="فيلا">فيلا</option>
                  <option value="تاون هاوس">تاون هاوس</option>
                  <option value="تجاري">تجاري</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-muted-foreground">الموقع / المدينة *</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="مثال: المنذرة / الإسكندرية"
                  className="w-full rounded-xl border border-border bg-muted py-3 pl-4 pr-10 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-muted-foreground">تحديد المكان بدقة على الخريطة</label>
              <p className="mb-3 text-sm text-muted-foreground">
                اختياري لكنه مفيد جدًا عشان العقار يظهر في مكانه الصحيح بدل الاعتماد على اسم المنطقة فقط.
              </p>
              <LocationPickerMap value={selectedCoordinates} onChange={setSelectedCoordinates} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-muted-foreground">السعر (جنيه مصري) *</label>
              <div className="relative">
                <Banknote className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  required
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  type="number"
                  min="0"
                  placeholder="مثال: 4500000"
                  className="w-full rounded-xl border border-border bg-muted py-3 pl-4 pr-10 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-muted-foreground">المساحة (متر مربع) *</label>
              <input
                required
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                type="number"
                min="1"
                placeholder="مثال: 159"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-muted-foreground">عدد غرف النوم *</label>
              <input
                required
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                type="number"
                min="0"
                placeholder="مثال: 3"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-muted-foreground">عدد الحمامات *</label>
              <input
                required
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                type="number"
                min="0"
                placeholder="مثال: 3"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-muted-foreground">وصف تفصيلي للعقار *</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                placeholder="اكتب وصفًا مفصلًا عن العقار ومميزاته..."
                className="w-full resize-none rounded-xl border border-border bg-muted px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'جارٍ نشر العقار...' : 'نشر العقار'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default AddPropertyPage;
