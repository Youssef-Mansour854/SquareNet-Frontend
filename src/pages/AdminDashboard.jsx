import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Home as HomeIcon, Star, MessageCircle,
  TrendingUp, Eye, Award, Clock, ShieldCheck, Trash2, Check, X,
  MoreVertical, Shield, User as UserIcon, Flag, Plus, UserPlus, AlertCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://squarenet-backend-production.up.railway.app';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, token: authContextToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, properties, reviews
  const [fetchError, setFetchError] = useState('');

  // Management States
  const [allUsers, setAllUsers] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Add Admin Modal States
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [addAdminError, setAddAdminError] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
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

  const getAuthToken = () => authContextToken || sessionStorage.getItem('squareNetAuthToken') || localStorage.getItem('squareNetAuthToken');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStats(data.data);
      } else {
        setFetchError(data.message || 'فشل جلب الإحصائيات. تأكد من صلاحياتك.');
      }
    } catch (err) {
      setFetchError('فشل الاتصال بالسيرفر. تأكد من تشغيل الـ back-end.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAllUsers(data.data);
      } else {
        setFetchError(data.message || 'فشل جلب قائمة المستخدمين.');
      }
    } catch (err) {
      setFetchError('فشل الاتصال بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/properties`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAllProperties(data.data);
      } else {
        setFetchError(data.message || 'فشل جلب قائمة العقارات.');
      }
    } catch (err) {
      setFetchError('فشل الاتصال بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/reviews`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAllReviews(data.data);
      } else {
        setFetchError(data.message || 'فشل جلب قائمة التقييمات.');
      }
    } catch (err) {
      setFetchError('فشل الاتصال بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
      navigate('/');
      return;
    }

    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'properties') fetchProperties();
    if (activeTab === 'reviews') fetchReviews();
  }, [currentUser, navigate, activeTab]);

  // Actions
  const handleUserAction = async (userId, action, value) => {
    if (!window.confirm('هل أنت متأكد من تنفيذ هذا الإجراء؟')) return;
    setIsActionLoading(true);
    try {
      let url = `${API_BASE_URL}/api/v1/admin/users/${userId}`;
      let method = 'PUT';
      let body = null;

      if (action === 'delete') method = 'DELETE';
      if (action === 'role') {
        url += '/role';
        body = JSON.stringify({ role: value });
      }
      if (action === 'toggle-active') {
        url += '/toggle-active';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body,
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const errData = await res.json();
        alert(errData.message || 'فشلت العملية');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddAdminError('');
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(newAdmin),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddAdminModal(false);
        setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
        fetchUsers();
      } else {
        setAddAdminError(data.message || 'حدث خطأ أثناء إضافة المدير');
      }
    } catch (err) {
      setAddAdminError('فشل الاتصال بالخادم');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePropertyAction = async (propId, action) => {
    if (!window.confirm('هل أنت متأكد من تنفيذ هذا الإجراء؟')) return;
    setIsActionLoading(true);
    try {
      let url = `${API_BASE_URL}/api/v1/admin/properties/${propId}`;
      let method = 'DELETE';

      if (action === 'toggle-featured') {
        url += '/toggle-featured';
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      if (res.ok) fetchProperties();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!currentUser) return null;

  const getUserLabel = (user) => {
    if (user.role === 'superadmin') return 'مدير عام المنصة';
    if (user.role === 'admin') return 'مدير النظام';
    const typeLabels = { buyer: 'مشتري', owner: 'صاحب عقار', agent: 'وسيط' };
    return typeLabels[user.accountType] || user.accountType;
  };

  const userTypeLabels = { buyer: 'مشتري', owner: 'صاحب عقار', agent: 'وسيط' };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300" dir="rtl">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={28} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground mb-1">لوحة تحكم المدير</h1>
              <p className="text-muted-foreground font-medium">
                مرحباً {currentUser.fullName || currentUser.name}
                <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                  <ShieldCheck size={12} />
                  {currentUser.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-card p-1.5 rounded-2xl border border-border w-fit">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
            { id: 'users', label: 'المستخدمين', icon: Users },
            { id: 'properties', label: 'العقارات', icon: HomeIcon },
            { id: 'reviews', label: 'التقييمات', icon: Star },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {fetchError && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 font-bold animate-in fade-in duration-300">
            <AlertCircle size={20} />
            {fetchError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {activeTab === 'overview' && stats && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'إجمالي المستخدمين', value: stats.overview.totalUsers, icon: Users, gradient: 'from-blue-500 to-blue-600' },
                    { label: 'إجمالي العقارات', value: stats.overview.totalProperties, icon: HomeIcon, gradient: 'from-emerald-500 to-emerald-600' },
                    { label: 'العقارات النشطة', value: stats.overview.activeProperties, icon: TrendingUp, gradient: 'from-green-500 to-green-600' },
                    { label: 'العقارات المباعة', value: stats.overview.soldProperties, icon: Award, gradient: 'from-amber-500 to-amber-600' },
                    { label: 'إجمالي التقييمات', value: stats.overview.totalReviews, icon: Star, gradient: 'from-yellow-500 to-yellow-600' },
                    { label: 'المحادثات', value: stats.overview.totalConversations, icon: MessageCircle, gradient: 'from-purple-500 to-purple-600' },
                  ].map((card, i) => (
                    <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm group">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                          <card.icon size={26} className="text-white" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm font-bold">{card.label}</p>
                          <h3 className="text-3xl font-black mt-1">{card.value.toLocaleString('en-US')}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                      <Users size={22} className="text-primary" />
                      توزيع المستخدمين
                    </h2>
                    <div className="space-y-4">
                      {Object.entries(stats.userTypes).map(([type, count]) => {
                        const percentage = stats.overview.totalUsers ? Math.round((count / stats.overview.totalUsers) * 100) : 0;
                        return (
                          <div key={type}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold">{userTypeLabels[type] || type}</span>
                              <span className="text-sm font-bold text-muted-foreground">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                      <Clock size={22} className="text-primary" />
                      أحدث المستخدمين
                    </h2>
                    <div className="space-y-4">
                      {stats.recentUsers.map((user) => (
                        <div key={user._id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                          <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm overflow-hidden">
                            {user.profileImg ? <img src={user.profileImg} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold">إدارة المستخدمين</h2>
                    <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full">
                      {allUsers.length} مستخدم
                    </span>
                  </div>
                  {currentUser.role === 'superadmin' && (
                    <button
                      onClick={() => setShowAddAdminModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
                    >
                      <UserPlus size={18} />
                      إضافة مدير جديد
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="p-5 text-sm font-bold">المستخدم</th>
                        <th className="p-5 text-sm font-bold">النوع</th>
                        <th className="p-5 text-sm font-bold">الصلاحية</th>
                        <th className="p-5 text-sm font-bold">الحالة</th>
                        <th className="p-5 text-sm font-bold">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                {user.profileImg ? <img src={user.profileImg} className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-muted-foreground" />}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-sm font-medium">{getUserLabel(user)}</td>
                          <td className="p-5">
                            <select
                              value={user.role}
                              onChange={(e) => handleUserAction(user._id, 'role', e.target.value)}
                              disabled={currentUser.role !== 'superadmin' || user._id === currentUser.id}
                              className="text-xs font-bold bg-muted/50 border border-border rounded-lg px-2 py-1 outline-none focus:ring-1 ring-primary disabled:opacity-50"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              <option value="superadmin">Super Admin</option>
                            </select>
                          </td>
                          <td className="p-5">
                            <button
                              onClick={() => handleUserAction(user._id, 'toggle-active')}
                              disabled={currentUser.role !== 'superadmin' && user.role === 'superadmin'}
                              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                user.active
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              } disabled:opacity-50`}
                            >
                              {user.active ? 'نشط' : 'معطل'}
                            </button>
                          </td>
                          <td className="p-5">
                            <button
                              onClick={() => handleUserAction(user._id, 'delete')}
                              disabled={user._id === currentUser.id || (currentUser.role !== 'superadmin' && user.role !== 'user')}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-30"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                  <h2 className="text-xl font-extrabold">إدارة العقارات</h2>
                  <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {allProperties.length} عقار
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="p-5 text-sm font-bold">العقار</th>
                        <th className="p-5 text-sm font-bold">المالك</th>
                        <th className="p-5 text-sm font-bold">السعر</th>
                        <th className="p-5 text-sm font-bold">المميزة</th>
                        <th className="p-5 text-sm font-bold">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allProperties.map((prop) => (
                        <tr key={prop._id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                                <img src={prop.image} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-sm truncate max-w-[200px]">{prop.title}</p>
                                <p className="text-xs text-muted-foreground">{prop.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <p className="text-sm font-bold">{prop.ownerId?.name || '-'}</p>
                            <p className="text-xs text-muted-foreground">{prop.ownerId?.email || '-'}</p>
                          </td>
                          <td className="p-5 text-sm font-black">{prop.price?.toLocaleString()} ج.م</td>
                          <td className="p-5">
                            <button
                              onClick={() => handlePropertyAction(prop._id, 'toggle-featured')}
                              className={`p-2 rounded-xl transition-all ${
                                prop.featured
                                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-inner'
                                  : 'text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              <Award size={20} fill={prop.featured ? 'currentColor' : 'none'} />
                            </button>
                          </td>
                          <td className="p-5">
                            <button
                              onClick={() => handlePropertyAction(prop._id, 'delete')}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border bg-muted/30">
                  <h2 className="text-xl font-extrabold">إدارة التقييمات</h2>
                </div>
                <div className="divide-y divide-border">
                  {allReviews.map((review) => (
                    <div key={review._id} className="p-6 hover:bg-muted/20 transition-colors flex justify-between items-start gap-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {review.user?.profileImg ? <img src={review.user.profileImg} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-sm">{review.user?.name}</p>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs font-bold text-primary mb-2">على عقار: {review.property?.title || 'عقار محذوف'}</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {allReviews.length === 0 && (
                    <div className="p-20 text-center text-muted-foreground font-bold">لا يوجد تقييمات حالياً</div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                <UserPlus size={22} className="text-primary" />
                إضافة مدير جديد
              </h3>
              <button onClick={() => setShowAddAdminModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              {addAdminError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl">
                  {addAdminError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold mb-1.5 mr-1">الاسم الكامل</label>
                <input
                  required
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary transition-all"
                  placeholder="أدخل اسم المدير"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1.5 mr-1">البريد الإلكتروني</label>
                <input
                  required
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary transition-all"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1.5 mr-1">كلمة المرور</label>
                <input
                  required
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary transition-all"
                  placeholder="********"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1.5 mr-1">نوع الصلاحية</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary transition-all font-bold"
                >
                  <option value="admin">مدير نظام (Admin)</option>
                  <option value="superadmin">مدير عام (Super Admin)</option>
                </select>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="w-full py-3 bg-primary text-primary-foreground font-black rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isActionLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={20} />}
                  تأكيد الإضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
