import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#5B0E2D]/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-10 h-10 gradient-wine rounded-xl flex items-center justify-center font-bold text-lg glow-wine-sm">
            CN
          </div>
          <span className="text-2xl font-bold">Chat<span className="text-gradient">Nex</span></span>
        </Link>

        <div className="card-glass rounded-2xl p-10 space-y-6">
          <div className="w-16 h-16 gradient-wine rounded-2xl flex items-center justify-center mx-auto glow-wine">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Acesso por contratação</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Para ter acesso ao ChatNex, entre em contato pelo WhatsApp.
              Após a contratação, sua conta será criada e você receberá os dados de acesso.
            </p>
          </div>

          <a
            href="https://wa.me/5511923999249?text=Ol%C3%A1%21+Quero+contratar+o+ChatNex+e+criar+minha+conta%21"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wine w-full py-4 rounded-xl font-semibold text-sm block glow-wine"
          >
            Falar no WhatsApp para contratar
          </a>

          <p className="text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/login" className="text-[#A61B4D] hover:text-[#c42460] font-medium">
              Fazer login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          ChatNex por{' '}
          <a href="https://instagram.com/agencynodex" target="_blank" rel="noopener noreferrer" className="text-[#A61B4D]">
            Nodex
          </a>
        </p>
      </div>
    </div>
  );
}
