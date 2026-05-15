import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../../../shared/services/api';
import logoImage from '../../../assets/logomixer.png';

type LoginPageProps = {
  onLoginSuccess: () => void;
};

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await adminApi.login(email, password);
      const { accessToken } = response.data.data;
      localStorage.setItem('admin_token', accessToken);
      onLoginSuccess();
    } catch (error) {
      alert('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F3F3] lg:grid lg:grid-cols-2">
      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_18px_45px_-22px_rgba(0,0,0,0.22)] sm:p-10">
          <h1 className="mb-8 text-center text-fluid-xl font-bold text-[#EE3F57]">Đăng nhập</h1>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-fluid-sm font-medium text-slate-600">
                Email / Username
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Nhập email hoặc username"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-fluid-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-fluid-sm font-medium text-slate-600">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-fluid-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-[#EE3F57] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-fluid-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#EE3F57] focus:ring-[#EE3F57]"
                />
                Remember me
              </label>

              <a href="#" className="font-medium text-[#EE3F57] transition-colors hover:text-[#d63249]">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#EE3F57] px-5 py-3.5 text-fluid-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#d63249] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#EE3F57]/25"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </section>

      <section className="hidden items-center justify-center bg-[linear-gradient(135deg,#F27121_10%,#E94057_60%,#8A2387_100%)] p-12 text-white lg:flex">
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
            <img src={logoImage} alt="Mixer Logo" className="h-16 w-16 rounded-2xl object-cover" />
          </div>

          <h2 className="text-fluid-xl font-bold tracking-tight">Mixer</h2>
          <p className="mt-4 text-fluid-lg font-medium text-white/90">Mix your moment</p>
        </div>
      </section>
    </div>
  );
}
