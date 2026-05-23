import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0D0D0D]/80 backdrop-blur-lg border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-wine flex items-center justify-center text-sm font-bold">
              CN
            </div>
            <span className="text-xl font-bold">Chat<span className="text-gradient">Nex</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#how" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Entrar
            </Link>
            <Link href="/register" className="btn-wine px-5 py-2 rounded-lg text-sm font-medium">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#A61B4D]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#5B0E2D]/20 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#A61B4D]/30 rounded-full px-4 py-2 text-sm text-[#A61B4D] mb-8 glow-wine-sm">
            <span className="w-2 h-2 bg-[#A61B4D] rounded-full animate-pulse" />
            Powered by OpenAI GPT-4o
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Atendimento com IA<br />
            <span className="text-gradient">no WhatsApp</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Automatize o atendimento da sua empresa com inteligência artificial.
            Responda clientes 24/7, escale seu suporte e nunca perca uma oportunidade de venda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/register" className="btn-wine px-8 py-4 rounded-xl text-base font-semibold glow-wine">
              Começar gratuitamente →
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-xl text-base font-semibold border border-[#2a2a2a] hover:border-[#A61B4D]/50 transition-all">
              Fazer login
            </Link>
          </div>

          {/* Mock dashboard preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="card-glass rounded-2xl p-1 glow-wine">
              <div className="bg-[#141414] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2a]">
                  <div className="w-3 h-3 rounded-full bg-[#A61B4D]" />
                  <div className="w-3 h-3 rounded-full bg-[#7A123B]" />
                  <div className="w-3 h-3 rounded-full bg-[#5B0E2D]" />
                  <span className="text-xs text-gray-500 ml-2">ChatNex Dashboard</span>
                </div>
                <div className="grid grid-cols-4 gap-4 p-6">
                  {[
                    { label: 'Conversas', value: '2.847', trend: '+12%' },
                    { label: 'Mensagens Hoje', value: '483', trend: '+8%' },
                    { label: 'Taxa de Resposta', value: '99.2%', trend: '+0.3%' },
                    { label: 'Satisfação', value: '4.9/5', trend: '+0.1' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#0D0D0D] rounded-lg p-4 border border-[#1a1a1a]">
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-green-400 mt-1">{stat.trend}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tudo que você precisa para <span className="text-gradient">escalar</span>
            </h2>
            <p className="text-gray-400 text-lg">Uma plataforma completa para automatizar seu atendimento</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🤖',
                title: 'IA com GPT-4o',
                desc: 'Respostas inteligentes e contextuais. A IA aprende sobre sua empresa e responde como um atendente humano.',
              },
              {
                icon: '📱',
                title: 'WhatsApp Real',
                desc: 'Conecte seu número via QR Code. Sem APIs não-oficiais. Integração com Evolution API.',
              },
              {
                icon: '⚡',
                title: 'Tempo Real',
                desc: 'Acompanhe conversas ao vivo. Chat com atualização instantânea via WebSocket.',
              },
              {
                icon: '🏢',
                title: 'Multi-empresa',
                desc: 'Cada empresa tem seu próprio ambiente. Dados isolados e seguros.',
              },
              {
                icon: '📊',
                title: 'Dashboard Completo',
                desc: 'Métricas, conversas, histórico e status do WhatsApp em um único lugar.',
              },
              {
                icon: '🔧',
                title: 'Totalmente Customizável',
                desc: 'Configure o prompt da IA, horários, produtos, FAQ e regras de atendimento.',
              },
            ].map((f) => (
              <div key={f.title} className="card-glass rounded-xl p-6 hover:border-[#A61B4D]/30 transition-all group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#A61B4D] transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como <span className="text-gradient">funciona</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Crie sua conta', desc: 'Cadastre sua empresa em segundos' },
              { step: '02', title: 'Conecte o WhatsApp', desc: 'Escaneie o QR Code com seu celular' },
              { step: '03', title: 'Configure a IA', desc: 'Adicione informações da sua empresa' },
              { step: '04', title: 'Pronto!', desc: 'A IA começa a responder automaticamente' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-[#A61B4D]/50 to-transparent z-0" />
                )}
                <div className="relative z-10 w-12 h-12 gradient-wine rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4 glow-wine-sm">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Perguntas <span className="text-gradient">frequentes</span></h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Como o ChatNex se integra ao WhatsApp?',
                a: 'Usamos a Evolution API, uma solução robusta que permite conectar seu WhatsApp via QR Code, sem precisar de aprovação do Meta.',
              },
              {
                q: 'A IA pode atender 24 horas por dia?',
                a: 'Sim! A IA funciona 24/7, respondendo automaticamente seus clientes a qualquer hora. Você pode configurar horários de funcionamento se preferir.',
              },
              {
                q: 'Posso personalizar as respostas da IA?',
                a: 'Totalmente. Você configura o prompt, produtos, FAQ, horários e regras de comportamento da IA diretamente no dashboard.',
              },
              {
                q: 'É possível atender manualmente?',
                a: 'Sim. Você pode desativar a IA em uma conversa específica e responder manualmente pelo chat ao vivo do dashboard.',
              },
            ].map((item) => (
              <details key={item.q} className="card-glass rounded-xl group">
                <summary className="px-6 py-4 cursor-pointer font-medium flex items-center justify-between list-none">
                  {item.q}
                  <span className="text-[#A61B4D] text-lg">+</span>
                </summary>
                <p className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-glass rounded-2xl p-12 glow-wine">
            <h2 className="text-4xl font-bold mb-4">
              Pronto para <span className="text-gradient">automatizar</span>?
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Junte-se a centenas de empresas que já usam o ChatNex para escalar seu atendimento.
            </p>
            <Link href="/register" className="btn-wine px-10 py-4 rounded-xl text-base font-semibold inline-block glow-wine">
              Começar agora — é grátis →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-wine flex items-center justify-center text-xs font-bold">CN</div>
            <span className="font-bold">ChatNex</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 ChatNex — Desenvolvido por{' '}
            <span className="text-[#A61B4D]">Nodex</span> — Agência de Marketing Digital
          </p>
        </div>
      </footer>
    </div>
  );
}
