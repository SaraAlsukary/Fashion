import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';

interface StoreFormData {
    StoreName: string;
    Description: string;
    Address: string;
    WorkingHoursStart: string;
    WorkingHoursEnd: string;
    PhoneNumber: string;
    Email: string;
}

interface StoreFilesData {
    Logo: File | null;
    FeaturedImage: File | null;
    NationalIdFrontImage: File | null;
    NationalIdBackImage: File | null;
    StoreLicense: File | null;
}

// واجهة لتمثيل الأخطاء المحتملة
type FormErrors = Partial<Record<keyof StoreFormData | keyof StoreFilesData | 'SubmitError', string>>;

export default function RegisterStore() {
    const navigate = useNavigate();
    const { addStoreRequest, isAddingRequest } = useStore();

    const [step, setStep] = useState<number>(1);
    const [errors, setErrors] = useState<FormErrors>({}); // حالة لتخزين الأخطاء

    const [formData, setFormData] = useState<StoreFormData>({
        StoreName: '',
        Description: '',
        Address: '',
        WorkingHoursStart: '',
        WorkingHoursEnd: '',
        PhoneNumber: '',
        Email: ''
    });

    const [files, setFiles] = useState<StoreFilesData>({
        Logo: null,
        FeaturedImage: null,
        NationalIdFrontImage: null,
        NationalIdBackImage: null,
        StoreLicense: null
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // مسح الخطأ عند بدء الكتابة
        if (errors[name as keyof StoreFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles.length > 0) {
            setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
            // مسح الخطأ عند اختيار ملف
            if (errors[name as keyof StoreFilesData]) {
                setErrors(prev => ({ ...prev, [name]: undefined }));
            }
        }
    };

    // دالة التحقق الشاملة للمرحلة الحالية
    const validateCurrentStep = (): boolean => {
        const newErrors: FormErrors = {};

        if (step === 1) {
            if (!formData.StoreName.trim()) newErrors.StoreName = 'اسم المتجر مطلوب.';
            if (!formData.Email.trim()) {
                newErrors.Email = 'البريد الإلكتروني مطلوب.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
                newErrors.Email = 'صيغة البريد الإلكتروني غير صحيحة.';
            }
            if (!formData.PhoneNumber.trim()) newErrors.PhoneNumber = 'رقم الهاتف مطلوب.';
            if (!formData.Description.trim()) newErrors.Description = 'وصف المتجر مطلوب.';
        }

        if (step === 2) {
            if (!formData.Address.trim()) newErrors.Address = 'العنوان التفصيلي مطلوب.';
            if (!formData.WorkingHoursStart) newErrors.WorkingHoursStart = 'وقت بداية العمل مطلوب.';
            if (!formData.WorkingHoursEnd) newErrors.WorkingHoursEnd = 'وقت نهاية العمل مطلوب.';
        }

        if (step === 3) {
            if (!files.Logo) newErrors.Logo = 'شعار المتجر مطلوب.';
            if (!files.FeaturedImage) newErrors.FeaturedImage = 'الصورة الرئيسية مطلوبة.';
            if (!files.NationalIdFrontImage) newErrors.NationalIdFrontImage = 'صورة الهوية الأمامية مطلوبة.';
            if (!files.NationalIdBackImage) newErrors.NationalIdBackImage = 'صورة الهوية الخلفية مطلوبة.';
            if (!files.StoreLicense) newErrors.StoreLicense = 'رخصة المتجر مطلوبة.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setStep(prev => prev + 1);
            setErrors({}); // تفريغ الأخطاء عند الانتقال الناجح
        }
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        setErrors({});
    };

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateCurrentStep()) return;

    const dataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
        // إضافة الثواني لحقول الوقت لتتوافق مع TimeSpan في C#
        if (key === 'WorkingHoursStart' || key === 'WorkingHoursEnd') {
            dataToSend.append(key, value.length === 5 ? `${value}:00` : value);
        } else {
            dataToSend.append(key, value);
        }
    });

    Object.entries(files).forEach(([key, file]) => {
        if (file) {
            dataToSend.append(key, file);
        }
    });

    addStoreRequest(dataToSend, {
        onSuccess: () => {
            navigate('/');
        },
        onError: (error: any) => {
            // استخراج رسالة الخطأ الحقيقية من السيرفر بدلاً من رسالة أكسيوس العامة
            const serverError = error?.response?.data?.message || error?.response?.data || error?.message;
            const errorMessage = typeof serverError === 'string' 
                ? serverError 
                : 'حدث خطأ غير متوقع أثناء إرسال الطلب، تأكد من صحة البيانات والمرفقات.';
            
            setErrors({ SubmitError: errorMessage });
        }
    });
};

    return (
        <div className="animate-fade-in-up delay-100 max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تقديم طلب انضمام كمتجر</h2>
            <p className="text-sm text-moda-grayText mb-6">يرجى ملء البيانات التالية بدقة لإنشاء متجرك على منصتنا.</p>

            {/* شريط تقدم المراحل */}
            <div className="mb-8 flex items-center justify-between relative before:content-[''] before:absolute before:h-0.5 before:w-full before:bg-gray-200 before:top-1/2 before:transform before:-translate-y-1/2 before:-z-10 z-0">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${step >= 1 ? 'bg-moda-purple text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${step >= 2 ? 'bg-moda-purple text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${step >= 3 ? 'bg-moda-purple text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
            </div>

            {/* رسالة الخطأ العامة للإرسال */}
            {errors.SubmitError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                    {errors.SubmitError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                {/* المرحلة الأولى */}
                {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-base font-bold text-moda-purple border-b pb-2 border-gray-100">المرحلة 1: المعلومات الأساسية</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">اسم المتجر</label>
                                <input type="text" name="StoreName" value={formData.StoreName} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.StoreName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'} focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white`} placeholder="متجر مودة للأزياء" />
                                {errors.StoreName && <p className="text-xs text-red-500">{errors.StoreName}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">البريد الإلكتروني للمتجر</label>
                                <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.Email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'} focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white`} placeholder="store@example.com" />
                                {errors.Email && <p className="text-xs text-red-500">{errors.Email}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">رقم الهاتف</label>
                            <input type="tel" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.PhoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'} focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white text-right`} placeholder="+966500000000" />
                            {errors.PhoneNumber && <p className="text-xs text-red-500">{errors.PhoneNumber}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">وصف المتجر</label>
                            <textarea name="Description" rows={3} value={formData.Description} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.Description ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'} focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white resize-none`} placeholder="اكتب نبذة قصيرة عن المنتجات التي يقدمها متجرك..." />
                            {errors.Description && <p className="text-xs text-red-500">{errors.Description}</p>}
                        </div>
                    </div>
                )}

                {/* المرحلة الثانية */}
                {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-base font-bold text-moda-purple border-b pb-2 border-gray-100">المرحلة 2: الموقع وساعات العمل</h3>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">العنوان بالتفصيل</label>
                            <input type="text" name="Address" value={formData.Address} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.Address ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'} focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white`} placeholder="المدينة، اسم الشارع، مبنى رقم..." />
                            {errors.Address && <p className="text-xs text-red-500">{errors.Address}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">بداية ساعات العمل</label>
                                <input type="time" name="WorkingHoursStart" value={formData.WorkingHoursStart} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.WorkingHoursStart ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'} focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white`} />
                                {errors.WorkingHoursStart && <p className="text-xs text-red-500">{errors.WorkingHoursStart}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">نهاية ساعات العمل</label>
                                <input type="time" name="WorkingHoursEnd" value={formData.WorkingHoursEnd} onChange={handleInputChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.WorkingHoursEnd ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-moda-purple focus:ring-moda-purple'} focus:ring-1 outline-none transition-all text-sm bg-gray-50 focus:bg-white`} />
                                {errors.WorkingHoursEnd && <p className="text-xs text-red-500">{errors.WorkingHoursEnd}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* المرحلة الثالثة */}
                {step === 3 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-base font-bold text-moda-purple border-b pb-2 border-gray-100">المرحلة 3: الوثائق والصور المطلوبة</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">شعار المتجر (Logo)</label>
                                <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl h-24 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all px-2 text-center ${errors.Logo ? 'border-red-500' : 'border-gray-300'}`}>
                                    <span className={`text-xs truncate w-full ${errors.Logo ? 'text-red-500' : 'text-gray-500'}`}>{files.Logo ? files.Logo.name : 'اختر ملف الصورة'}</span>
                                    <input type="file" name="Logo" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                                {errors.Logo && <p className="text-xs text-red-500">{errors.Logo}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">الصورة الرئيسية للمتجر</label>
                                <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl h-24 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all px-2 text-center ${errors.FeaturedImage ? 'border-red-500' : 'border-gray-300'}`}>
                                    <span className={`text-xs truncate w-full ${errors.FeaturedImage ? 'text-red-500' : 'text-gray-500'}`}>{files.FeaturedImage ? files.FeaturedImage.name : 'اختر ملف الصورة'}</span>
                                    <input type="file" name="FeaturedImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                                {errors.FeaturedImage && <p className="text-xs text-red-500">{errors.FeaturedImage}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">صورة الهوية الوطنية (الأمامية)</label>
                                <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl h-24 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all px-2 text-center ${errors.NationalIdFrontImage ? 'border-red-500' : 'border-gray-300'}`}>
                                    <span className={`text-xs truncate w-full ${errors.NationalIdFrontImage ? 'text-red-500' : 'text-gray-500'}`}>{files.NationalIdFrontImage ? files.NationalIdFrontImage.name : 'اختر ملف الهوية الأمامي'}</span>
                                    <input type="file" name="NationalIdFrontImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                                {errors.NationalIdFrontImage && <p className="text-xs text-red-500">{errors.NationalIdFrontImage}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">صورة الهوية الوطنية (الخلفية)</label>
                                <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl h-24 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all px-2 text-center ${errors.NationalIdBackImage ? 'border-red-500' : 'border-gray-300'}`}>
                                    <span className={`text-xs truncate w-full ${errors.NationalIdBackImage ? 'text-red-500' : 'text-gray-500'}`}>{files.NationalIdBackImage ? files.NationalIdBackImage.name : 'اختر ملف الهوية الخلفي'}</span>
                                    <input type="file" name="NationalIdBackImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                                {errors.NationalIdBackImage && <p className="text-xs text-red-500">{errors.NationalIdBackImage}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">رخصة المتجر / السجل التجاري</label>
                            <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl h-20 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all px-2 text-center ${errors.StoreLicense ? 'border-red-500' : 'border-gray-300'}`}>
                                <span className={`text-xs truncate w-full ${errors.StoreLicense ? 'text-red-500' : 'text-gray-500'}`}>{files.StoreLicense ? files.StoreLicense.name : 'اختر ملف الرخصة (Image/PDF)'}</span>
                                <input type="file" name="StoreLicense" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
                            </label>
                            {errors.StoreLicense && <p className="text-xs text-red-500">{errors.StoreLicense}</p>}
                        </div>
                    </div>
                )}

                {/* أزرار التنقل والإرسال */}
                <div className="flex gap-4 mt-6">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 py-3.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all active:scale-[0.98]"
                        >
                            السابق
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex-1 py-3.5 rounded-xl font-bold bg-moda-purple hover:bg-moda-purpleHover text-white transition-all active:scale-[0.98]"
                        >
                            التالي
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isAddingRequest}
                            className={`flex-1 py-3.5 rounded-xl font-bold transition-all shadow-md ${isAddingRequest ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-moda-purple hover:bg-moda-purpleHover text-white hover:shadow-lg active:scale-[0.98]'}`}
                        >
                            {isAddingRequest ? 'جاري إرسال الطلب...' : 'إرسال طلب الانضمام'}
                        </button>
                    )}
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    لديك حساب بالفعل؟{' '}
                    <Link to="/auth/login" className="font-bold text-moda-purple hover:underline">
                        تسجيل الدخول
                    </Link>
                </p>

            </form>
        </div>
    );
}