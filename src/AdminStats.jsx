import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminStats() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.forisarasari.ir/api/winners/GetCount');
        setCount(response?.data ?? 0);
      } catch (err) {
        setError('خطا در دریافت اطلاعات');
        console.error('Error fetching count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
    // هر ۳۰ ثانیه یکبار آمار به‌روزرسانی می‌شود
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans"
         dir="rtl">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8 text-slate-800 font-sans">آمار ثبت‌نام</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center font-sans">{error}</div>
        ) : (
          <div className="text-center">
            <div className="text-5xl font-bold text-teal-600 mb-2 font-sans">{count.toLocaleString('fa-IR')}</div>
            <div className="text-slate-600 font-sans">تعداد کل ثبت‌نام‌کنندگان</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStats; 