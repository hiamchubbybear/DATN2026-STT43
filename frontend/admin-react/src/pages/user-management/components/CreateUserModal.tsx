import { useState } from 'react';
import { adminApi } from '../../../shared/services/api';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateUserModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    gender: 'Male',
    role: 'Client'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createUser(formData);
      alert('User created successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-fluid-base font-bold text-slate-800">Create New Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Display Name</label>
            <input
              required
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-fluid-sm outline-none focus:border-[#EE3F57] transition"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-fluid-sm outline-none focus:border-[#EE3F57] transition"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Password</label>
            <input
              required
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-fluid-sm outline-none focus:border-[#EE3F57] transition"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-fluid-sm outline-none focus:border-[#EE3F57] transition bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-fluid-sm outline-none focus:border-[#EE3F57] transition bg-white"
              >
                <option value="Client">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-fluid-sm font-bold text-slate-600 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#EE3F57] to-[#8A2387] px-4 py-3 text-fluid-sm font-bold text-white shadow-lg shadow-[#EE3F57]/20 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
