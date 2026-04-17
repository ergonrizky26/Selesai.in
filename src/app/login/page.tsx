import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4">
            <AuthForm />

            <p className="mt-8 text-sm text-slate-400 text-center max-w-xs">
                Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
            </p>
        </div>
    );
}