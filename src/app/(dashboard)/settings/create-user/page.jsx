/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/settings/create-user/page.tsx
'use client';
import { useState } from 'react';
import { register } from '@/services/auth';
const CreateUserPage = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        username: '',
        password: '',
        role: '',
        school_id: null,
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(Object.assign(Object.assign({}, formData), { [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            // Create a RegisterPayload from the form data
            const registerPayload = {
                full_name: formData.full_name,
                email: formData.email,
                username: formData.username,
                password: formData.password,
                role: formData.role,
                school_id: formData.school_id
            };
            const response = await register(registerPayload);
            setMessage(response);
            // Optionally reset the form after successful creation
            setFormData({ full_name: '', email: '', username: '', password: '', role: '', school_id: null });
        }
        catch (err) {
            setError(err.message || 'Could not create user');
        }
    };
    return (<div>
      <h1 className="text-xl font-semibold mb-4">Create New User</h1>
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required/>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required/>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required/>
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="student">Student</option>
            {/* Add other roles as needed */}
          </select>
        </div>
        <div>
          <label htmlFor="school_id" className="block text-sm font-medium text-gray-700">School ID</label>
          <input type="number" id="school_id" name="school_id" value={formData.school_id || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Create User</button>
      </form>
    </div>);
};
export default CreateUserPage;
