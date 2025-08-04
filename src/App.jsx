import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import logo from './assets/logo.webp';

// --- آیکون‌ها ---
const UserIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const DocumentIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const CheckCircleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>;


function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    passportNumber: "",
    phoneNumber: "",
    accountNumber: "",
  });
  const [files, setFiles] = useState({
    householdDecileImage: { file: null, preview: null },
    passportImage: { file: null, preview: null },
    sajamImage: { file: null, preview: null },
  });
  const [errors, setErrors] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const MAX_FILE_SIZE = 3 * 1024 * 1024;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      setFiles((prev) => ({ ...prev, [name]: { file, preview: URL.createObjectURL(file) } }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  useEffect(() => {
    return () => { Object.values(files).forEach(item => { if (item.preview) URL.revokeObjectURL(item.preview); }); };
  }, [files]);

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = "وارد کردن نام الزامی است.";
      if (!formData.lastName) newErrors.lastName = "وارد کردن نام خانوادگی الزامی است.";
      if (!formData.nationalId) newErrors.nationalId = "وارد کردن کد ملی الزامی است.";
      else if (!/^\d{10}$/.test(formData.nationalId)) newErrors.nationalId = "کد ملی باید ۱۰ رقم باشد.";
      if (!formData.passportNumber) newErrors.passportNumber = "وارد کردن شماره پاسپورت الزامی است.";
      if (!formData.phoneNumber) newErrors.phoneNumber = "وارد کردن شماره تلفن همراه الزامی است.";
      else if (!/^09\d{9}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "فرمت شماره تلفن همراه صحیح نیست.";
      if (!formData.accountNumber) newErrors.accountNumber = "وارد کردن شماره حساب بانکی الزامی است.";
      else if (!/^\d{5,20}$/.test(formData.accountNumber)) newErrors.accountNumber = "شماره حساب بانکی باید بین ۵ تا ۲۰ رقم باشد.";
    }
    if (step === 2) {
      Object.keys(files).forEach(key => {
        const labels = { householdDecileImage: 'دهک خانوار', passportImage: 'پاسپورت', sajamImage: 'سماح' };
        if (!files[key].file) newErrors[key] = `انتخاب تصویر ${labels[key]} الزامی است.`;
        else if (files[key].file.size > MAX_FILE_SIZE) newErrors[key] = "حجم فایل نباید بیشتر از ۳ مگابایت باشد.";
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep()) { setStep(s => s + 1); } };
  const prevStep = () => { setStep(s => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setIsLoading(true);
    setSubmissionError('');

    const dataToSubmit = new FormData();
    Object.keys(formData).forEach(key => dataToSubmit.append(key, formData[key]));
    Object.keys(files).forEach(key => { if (files[key].file) dataToSubmit.append(key, files[key].file); });

    try {
      const response = await axios.post('https://api.forisarasari.ir/api/winners/create', dataToSubmit);
      if (response.data) setSubmissionResult(response.data);
    } catch (error) {
      let errorMessage = 'خطا در ارتباط با سرور. لطفاً شبکه خود را بررسی کرده و دوباره تلاش کنید.'; // Default message

      if (error.response && error.response.data) {
        const errorData = error.response.data;
        // Case 1: Server sends a plain string (like your "BadRequest("message")")
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } 
        // Case 2: Server sends a validation problem details object (default for ModelState errors)
        else if (errorData.errors) {
          const messages = Object.values(errorData.errors).flat();
          if (messages.length > 0) {
            errorMessage = messages.join(' ');
          }
        }
        // Case 3: Server sends a simple JSON object with a 'message' or 'title' property
        else if (errorData.message) {
            errorMessage = errorData.message;
        } else if (errorData.title) {
            errorMessage = errorData.title;
        }
      }
      
      setSubmissionError(errorMessage);
      console.error('Submission error:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (name, label, type = "text") => (
    <div>
      <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-700 text-right">{label}</label>
      <input type={type} id={name} name={name} value={formData[name]} onChange={handleInputChange} className={`bg-gray-50 border ${errors[name] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-3 text-right transition-all duration-300`} />
      <AnimatePresence>{errors[name] && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-sm text-red-600 text-right">{errors[name]}</motion.p>}</AnimatePresence>
    </div>
  );

  const renderFileInput = (name, label) => (
    <div className="col-span-1">
      <label className="block mb-2 text-sm font-medium text-gray-700 text-right">{label}</label>
      <div className={`relative border-2 ${errors[name] ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-lg p-4 text-center group hover:border-teal-500 transition-all duration-300 h-40 flex items-center justify-center`}>
        {files[name].preview ? <img src={files[name].preview} alt="Preview" className="w-full h-full object-cover rounded-md" /> : <div className="flex flex-col items-center"><UploadIcon /><p className="text-xs text-gray-500 mt-2">انتخاب فایل</p></div>}
        <input type="file" name={name} onChange={handleFileChange} accept="image/*" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
      <AnimatePresence>{errors[name] && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-sm text-red-600 text-right">{errors[name]}</motion.p>}</AnimatePresence>
    </div>
  );

  const steps = [
    { number: 1, title: 'اطلاعات فردی', icon: UserIcon },
    { number: 2, title: 'بارگذاری مدارک', icon: DocumentIcon },
    { number: 3, title: 'تایید نهایی', icon: CheckCircleIcon },
  ];

  const slideAnimation = {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  };

  return (
    <div
      className="bg-slate-100 min-h-screen flex items-center justify-center p-4 font-sans"
      dir="rtl"
    >
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-400/20 flex overflow-hidden">
        {/* Left Side Panel */}
        <div className="w-1/3 bg-slate-800 p-8 text-white hidden md:flex flex-col justify-between">
          <div className="text-center">
            <img
              src={logo}
              alt="لوگو"
              className="w-28 h-28 rounded-full border-4 border-slate-700 mx-auto shadow-lg shadow-teal-500/20"
            />
            <h2 className="text-4xl font-bold mt-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              قرعه‌کشی بزرگ
            </h2>
            <p className="text-slate-400 mt-2 text-lg">کانال خبر فوری سراسری</p>
          </div>
          <div className="relative space-y-6">
            <div
              className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-700"
              aria-hidden="true"
            ></div>
            {steps.map((s) => (
              <div
                key={s.number}
                className="flex items-center gap-4 relative z-10"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    step >= s.number
                      ? "bg-teal-500"
                      : "bg-slate-800 border-2 border-slate-600"
                  }`}
                >
                  <s.icon className="w-6 h-6" />
                </div>
                <span
                  className={`font-medium transition-all duration-500 ${
                    step >= s.number ? "text-white" : "text-slate-500"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Panel (Form) */}
        <div className="w-full md:w-2/3 p-8">
          <AnimatePresence mode="wait">
            {!submissionResult ? (
              <motion.div key={step}>
                {step === 1 && (
                  <motion.div {...slideAnimation}>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">
                      مرحله ۱: اطلاعات فردی
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {renderInputField("firstName", "نام")}
                      {renderInputField("lastName", "نام خانوادگی")}
                      {renderInputField("nationalId", "کد ملی")}
                      {renderInputField("passportNumber", "شماره پاسپورت")}
                      {renderInputField(
                        "phoneNumber",
                        "شماره تلفن همراه",
                        "tel"
                      )}
                      {renderInputField(
                        "accountNumber",
                        "شماره حساب بانکی",
                        "text"
                      )}
                    </div>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div {...slideAnimation}>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">
                      مرحله ۲: بارگذاری مدارک
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {renderFileInput(
                        "householdDecileImage",
                        "تصویر دهک خانوار"
                      )}
                      {renderFileInput("passportImage", "تصویر پاسپورت")}
                      {renderFileInput("sajamImage", "تصویر ثبت‌نام سماح")}
                    </div>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div {...slideAnimation}>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">
                      مرحله ۳: بازبینی و تایید نهایی
                    </h2>
                    <div className="space-y-4 bg-slate-50 p-6 rounded-lg">
                      {Object.entries({
                        نام: formData.firstName,
                        "نام خانوادگی": formData.lastName,
                        "کد ملی": formData.nationalId,
                        "شماره تماس": formData.phoneNumber,
                      }).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-500">{k}:</span>
                          <span className="font-semibold text-slate-800">
                            {v}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-slate-500">مدارک:</span>
                        <div className="flex gap-2">
                          {Object.values(files).map(
                            (f, i) =>
                              f.file && (
                                <CheckCircleIcon
                                  key={i}
                                  className="w-6 h-6 text-green-500"
                                />
                              )
                          )}
                        </div>
                      </div>
                    </div>
                    {submissionError && (
                      <div className="mt-6 text-center p-3 text-sm text-red-800 rounded-lg bg-red-50">
                        {submissionError}
                      </div>
                    )}
                  </motion.div>
                )}
                <div className="mt-8 flex justify-between">
                  {step === 2 && (
                    <button
                      onClick={prevStep}
                      className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition"
                    >
                      قبلی
                    </button>
                  )}
                  {(step === 1 || step === 3) && <div />}
                  {step < 3 && (
                    <button
                      onClick={nextStep}
                      className="bg-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-600 transition"
                    >
                      بعدی
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-600 transition flex items-center disabled:opacity-50"
                    >
                      {isLoading ? <SpinnerIcon /> : "تایید و ارسال نهایی"}
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircleIcon className="h-24 w-24 text-teal-500 mx-auto" />
                <h2 className="text-3xl font-bold text-slate-800 mt-4">
                  ثبت نام با موفقیت انجام شد
                </h2>
                <p className="text-slate-600 mt-2">
                  اطلاعات شما با موفقیت در سیستم ثبت گردید.
                </p>
                <div className="mt-8 text-right bg-slate-50 rounded-lg p-6 inline-block">
                  <ul className="space-y-3">
                    {Object.entries({
                      نام: submissionResult.firstName,
                      "نام خانوادگی": submissionResult.lastName,
                      "کد ملی": submissionResult.nationalId,
                    }).map(([k, v]) => (
                      <li key={k} className="flex justify-between">
                        <span className="text-slate-500 ml-4">{k}:</span>
                        <span className="font-semibold text-slate-900">
                          {v}
                        </span>
                      </li>
                    ))}
                    <li className="flex items-center justify-between pt-3 border-t mt-3">
                      <span className="font-medium text-slate-500 ml-4">
                        کد پیگیری:
                      </span>
                      <span className="font-mono font-bold text-lg text-teal-600 bg-teal-100 px-3 py-1 rounded-md">
                        {submissionResult.trackingCode}
                      </span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
