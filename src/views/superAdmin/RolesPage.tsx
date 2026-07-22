// src/views/SuperAdmin/RolesPage.tsx
import React, { useState } from 'react';
import { useAddRole } from '../../hooks/useSuperAdmin';

const RolesPage = () => {
    const [roleName, setRoleName] = useState('');
    const addRoleMutation = useAddRole();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) return;

        addRoleMutation.mutate({ roleName }, {
            onSuccess: () => {
                setRoleName('');
                alert('تمت إضافة الدور بنجاح!');
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">إدارة الأدوار (Roles)</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">اسم الدور الجديد</label>
                    <input 
                        type="text" 
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="مثال: مدير محتوى, مشرف مالي..."
                        className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md transition disabled:opacity-50"
                    disabled={addRoleMutation.isPending || !roleName.trim()}
                >
                    {addRoleMutation.isPending ? 'جاري الإضافة...' : 'إضافة الدور'}
                </button>
            </form>

            <div className="pt-6 border-t mt-6">
                <p className="text-sm text-gray-500">
                    ملاحظة: سيتم إضافة الصلاحيات لاحقاً بناءً على متطلبات النظام، هذه الواجهة مخصصة لإنشاء اسم الدور الأساسي.
                </p>
            </div>
        </div>
    );
};

export default RolesPage;