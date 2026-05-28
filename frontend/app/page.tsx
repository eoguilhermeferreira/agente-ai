import Link from 'next/link';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import FlowArt, { FlowSection } from '@/components/ui/story-scroll';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0D0D0D]/90 backdrop-blur-lg border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-wine flex items-center justify-center text-sm font-bold">
              CN
            </div>
            <span className="text-xl font-bold">Chat<span className="text-gradient">Nex</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Entrar
            </Link>
            <a
              href="https://wa.me/5511923999249?text=Ol%C3%A1%21+Vim+pelo+site+do+ChatNex+e+quero+saber+como+come%C3%A7ar%21"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wine px-5 py-2 rounded-lg text-sm font-medium glow-wine-sm"
            >
              Começar agora
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#A61B4D]/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#5B0E2D]/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Atendimento 100%<br />
            automatizado no seu<br />
            <span className="text-gradient">WhatsApp!</span>
          </h1>

          <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto leading-relaxed">
            Pare de perder vendas por demora no atendimento. Sua IA responde clientes 24/7,
            qualifica leads e só te chama quando realmente precisa.
          </p>

          <p className="text-sm text-[#A61B4D] font-medium mb-10">
            ✓ Sem precisar ficar no celular &nbsp;·&nbsp; ✓ Sem perder cliente &nbsp;·&nbsp; ✓ Configura em minutos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="https://wa.me/5511923999249?text=Ol%C3%A1%21+Quero+automatizar+o+atendimento+do+meu+WhatsApp+com+o+ChatNex%21+Pode+me+ajudar%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wine px-8 py-4 rounded-xl text-base font-semibold glow-wine w-full sm:w-auto text-center"
            >
              Quero automatizar meu WhatsApp
            </a>
            <a href="#demo" className="px-8 py-4 rounded-xl text-base font-semibold border border-[#2a2a2a] hover:border-[#A61B4D]/50 transition-all w-full sm:w-auto text-center">
              Ver demo
            </a>
          </div>

          {/* Social proof numbers */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
            {[
              { value: '+500', label: 'Empresas ativas' },
              { value: '99,9%', label: 'Uptime garantido' },
              { value: '24/7', label: 'Atendimento ativo' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-gradient">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Dashboard 3D scroll animation */}
      <section className="bg-[#0D0D0D] -mt-10">
        <ContainerScroll
          titleComponent={
            <div className="mb-8">
              <p className="text-sm text-[#A61B4D] font-medium mb-2 uppercase tracking-widest">Dashboard em tempo real</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Tudo acontece<br />
                <span className="text-gradient">na sua tela</span>
              </h2>
            </div>
          }
        >
          {/* Dashboard mock inside the 3D card */}
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2a] bg-[#0D0D0D]">
              <div className="w-3 h-3 rounded-full bg-[#A61B4D]" />
              <div className="w-3 h-3 rounded-full bg-[#7A123B]" />
              <div className="w-3 h-3 rounded-full bg-[#5B0E2D]" />
              <span className="text-xs text-gray-500 ml-2">Pizzaria Bella Napoli</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">WhatsApp conectado</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 p-4 bg-[#0D0D0D]">
              {[
                { label: 'Pedidos Hoje', value: '47', trend: '+12 novos' },
                { label: 'Respondidos pela IA', value: '43', trend: '91% automático' },
                { label: 'Tempo Médio', value: '< 3s', trend: 'de resposta' },
                { label: 'Satisfação', value: '4.9★', trend: 'dos clientes' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#141414] rounded-lg p-3 border border-[#1a1a1a]">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-[#A61B4D] mt-1">{stat.trend}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-1 gap-0 overflow-hidden">
              {/* Conversations list */}
              <div className="w-64 border-r border-[#1a1a1a] bg-[#0D0D0D] overflow-hidden">
                <div className="px-3 py-2 border-b border-[#1a1a1a]">
                  <p className="text-xs font-medium text-gray-400">Conversas recentes</p>
                </div>
                {[
                  { name: 'Lucas M.', msg: 'Tem delivery para o centro?', time: '14:32', active: true },
                  { name: 'Fernanda C.', msg: 'Qual o preço da calabresa?', time: '14:28', active: false },
                  { name: 'Rafael A.', msg: 'Quanto tempo demora?', time: '14:15', active: false },
                  { name: 'Ana S.', msg: 'Boa noite! Cardápio completo?', time: '13:50', active: false },
                ].map((c) => (
                  <div key={c.name} className={`flex items-center gap-2 px-3 py-2.5 border-b border-[#1a1a1a] ${c.active ? 'bg-[#A61B4D]/10' : ''}`}>
                    <div className="w-7 h-7 gradient-wine rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.msg}</p>
                    </div>
                    <p className="text-xs text-gray-600 shrink-0">{c.time}</p>
                  </div>
                ))}
              </div>
              {/* Chat area */}
              <div className="flex-1 bg-[#111] flex flex-col overflow-hidden">
                <div className="px-4 py-2 border-b border-[#1a1a1a] flex items-center gap-2">
                  <div className="w-6 h-6 gradient-wine rounded-full flex items-center justify-center text-xs font-bold">L</div>
                  <p className="text-xs font-medium">Lucas M.</p>
                  <span className="ml-auto text-xs text-green-400">● IA ativa</span>
                </div>
                <div className="flex-1 p-3 space-y-2 overflow-hidden">
                  <div className="flex justify-start">
                    <div className="bg-[#1a1a1a] rounded-xl px-3 py-1.5 max-w-[70%]">
                      <p className="text-xs">Tem delivery para o centro?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="gradient-wine rounded-xl px-3 py-1.5 max-w-[70%]">
                      <p className="text-xs">Sim! Entregamos no centro. Frete R$ 5. Pedido mínimo R$ 30.</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#1a1a1a] rounded-xl px-3 py-1.5 max-w-[70%]">
                      <p className="text-xs">Quanto tempo demora?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="gradient-wine rounded-xl px-3 py-1.5 max-w-[70%]">
                      <p className="text-xs">Média de 35 a 45 minutos. Quer fazer seu pedido?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* Demo — AI chat mock */}
      <section id="demo" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Veja a IA <span className="text-gradient">em ação</span>
            </h2>
            <p className="text-gray-400 text-lg">Seu cliente manda, a IA responde na hora, 24 horas por dia</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Benefits list */}
            <div className="space-y-6">
              {[
                {
                  title: 'Resposta em menos de 3 segundos',
                  desc: 'Nenhum cliente fica esperando. A IA responde instantaneamente, a qualquer hora.',
                },
                {
                  title: 'Conhece seu negócio de cor',
                  desc: 'Você configura produtos, preços, FAQ e horários. A IA usa tudo isso nas respostas.',
                },
                {
                  title: 'Transfere para humano quando necessário',
                  desc: 'Quando o cliente precisa de atendimento especial, a IA avisa você na hora.',
                },
                {
                  title: 'Nunca mais perde uma venda',
                  desc: 'Clientes atendidos de madrugada, no feriado ou quando você está ocupado.',
                },
              ].map((b) => (
                <div key={b.title} className="border-l-2 border-[#A61B4D] pl-4">
                  <h3 className="font-semibold mb-1">{b.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Chat mock */}
            <div className="card-glass rounded-2xl overflow-hidden glow-wine">
              {/* WhatsApp header */}
              <div className="gradient-wine px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <div>
                  <p className="font-semibold text-sm">Pizzaria Bella Napoli</p>
                  <p className="text-xs text-white/70">● Online agora</p>
                </div>
              </div>
              {/* Messages */}
              <div className="bg-[#111] p-4 space-y-3 min-h-[320px]">
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">Boa noite! Vocês fazem delivery aqui no bairro Jardins?</p>
                    <p className="text-xs text-gray-500 mt-1 text-right">20:14</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="gradient-wine rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">Boa noite! Sim, entregamos no Jardins. Frete R$ 6, tempo médio 40 minutos. Quer ver nosso cardápio?</p>
                    <p className="text-xs text-white/70 mt-1 text-right">20:14 ✓✓</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">Sim! Qual o preço da pizza de frango?</p>
                    <p className="text-xs text-gray-500 mt-1 text-right">20:15</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="gradient-wine rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">Pizza de Frango com Catupiry: P R$ 39, M R$ 49, G R$ 59. Qual tamanho prefere?</p>
                    <p className="text-xs text-white/70 mt-1 text-right">20:15 ✓✓</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#A61B4D] rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                    <span className="w-2 h-2 bg-[#A61B4D] rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                    <span className="w-2 h-2 bg-[#A61B4D] rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                  </div>
                  <span className="text-xs text-gray-500">IA digitando...</span>
                </div>
              </div>
              <div className="bg-[#0D0D0D] px-4 py-3 text-center">
                <span className="text-xs text-[#A61B4D] font-medium">⚡ Respondeu em menos de 2 segundos</span>
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
            <p className="text-gray-400 text-lg">Uma plataforma completa para automatizar e gerenciar seu atendimento</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🤖',
                title: 'IA com GPT-4o',
                desc: 'Respostas inteligentes e contextuais. A IA aprende sobre sua empresa e atende como um humano, sem errar e sem cansaço.',
              },
              {
                icon: '📱',
                title: 'WhatsApp Oficial',
                desc: 'Conecte seu número via QR Code em segundos. Integração estável com Evolution API, sem risco de ban.',
              },
              {
                icon: '⚡',
                title: 'Chat ao Vivo',
                desc: 'Acompanhe todas as conversas em tempo real. Intervenha quando quiser e veja a IA trabalhando para você.',
              },
              {
                icon: '🔔',
                title: 'Alerta de Atendimento',
                desc: 'Quando a IA não consegue resolver, você recebe um alerta na hora para assumir o atendimento sem o cliente perceber.',
              },
              {
                icon: '📊',
                title: 'Dashboard Completo',
                desc: 'Métricas, histórico de conversas, status do WhatsApp e performance da IA em um único painel.',
              },
              {
                icon: '🔧',
                title: '100% Customizável',
                desc: 'Configure o prompt da IA, produtos, preços, FAQ e regras de atendimento. Sua empresa, seu jeito.',
              },
            ].map((f) => (
              <div key={f.title} className="card-glass rounded-xl p-6 hover:border-[#A61B4D]/40 transition-all group hover:-translate-y-1 duration-200">
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
            <h2 className="text-4xl font-bold mb-4">
              Configure em <span className="text-gradient">menos de 10 minutos</span>
            </h2>
            <p className="text-gray-400">Sem precisar de técnico, sem complicação</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Crie sua conta', desc: 'Cadastro simples e rápido' },
              { step: '02', title: 'Conecte o WhatsApp', desc: 'Escaneie o QR Code com seu celular' },
              { step: '03', title: 'Configure a IA', desc: 'Adicione produtos, preços e instruções' },
              { step: '04', title: 'Pronto!', desc: 'A IA já começa a atender seus clientes' },
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

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Quem usa, <span className="text-gradient">aprova</span>
            </h2>
            <p className="text-gray-400 text-lg">Empresas de todo o Brasil já automatizaram seu atendimento</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Lucas Mendonça',
                role: 'Dono, Clínica Estética Renata',
                avatar: 'LM',
                text: 'Antes eu perdia clientes de madrugada porque não tinha como responder. Agora a IA atende, agenda e manda os valores sozinha. Triplicou meu faturamento em 2 meses.',
                stars: 5,
              },
              {
                name: 'Fernanda Costa',
                role: 'Gerente, Loja FitStyle',
                avatar: 'FC',
                text: 'Minha equipe vivia no WhatsApp respondendo as mesmas perguntas. Com o ChatNex, a IA resolve 90% dos atendimentos e meu time foca em fechar vendas maiores.',
                stars: 5,
              },
              {
                name: 'Rafael Alves',
                role: 'CEO, Construtora RGA',
                avatar: 'RA',
                text: 'Configurei a IA com todos os nossos empreendimentos e ela já qualifica o lead antes de chegar pra mim. Economizei mais de 3 horas por dia. Vale cada centavo.',
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="card-glass rounded-xl p-6 flex flex-col gap-4 hover:border-[#A61B4D]/30 transition-all">
                <div className="flex gap-1">
                  {Array.from({length: t.stars}).map((_, i) => (
                    <span key={i} className="text-[#A61B4D] text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-[#2a2a2a]">
                  <div className="w-10 h-10 gradient-wine rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story scroll — Por que o ChatNex */}
      <FlowArt aria-label="Por que o ChatNex">
        <FlowSection aria-label="O problema" style={{ backgroundColor: '#A61B4D', color: '#fff' }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">01   O problema</p>
          <hr className="my-[2vw] border-t border-white/30" />
          <div>
            <h2 className="text-[clamp(3rem,10vw,11rem)] font-black leading-[0.85] uppercase tracking-tight">
              Clientes<br />
              Esperando.<br />
              Vendas<br />
              Perdidas.
            </h2>
          </div>
          <hr className="my-[2vw] border-t border-white/30" />
          <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2.5vw,1.75rem)] font-normal leading-relaxed opacity-90">
            Sem você no celular 24h por dia, seus clientes vão embora. A concorrência responde primeiro e fecha a venda. Você trabalha mais e ganha menos.
          </p>
        </FlowSection>

        <FlowSection aria-label="A solução" style={{ backgroundColor: '#0D0D0D', color: '#fff' }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A61B4D]">02   A solução</p>
          <hr className="my-[2vw] border-t border-[#2a2a2a]" />
          <div>
            <h2 className="text-[clamp(3rem,10vw,11rem)] font-black leading-[0.85] uppercase tracking-tight">
              IA que<br />
              Trabalha<br />
              Por Você.
            </h2>
          </div>
          <hr className="my-[2vw] border-t border-[#2a2a2a]" />
          <div className="flex flex-wrap gap-[3vw]">
            {[
              { title: 'Responde em 3 segundos', desc: 'Não importa o horário. A IA nunca descansa, nunca fica mal-humorada.' },
              { title: 'Conhece seu negócio', desc: 'Configurada com seus produtos, preços e regras. Fala só sobre a sua empresa.' },
              { title: 'Chama você quando precisa', desc: 'Situações complexas? A IA avisa na hora e passa para atendimento humano.' },
            ].map((item) => (
              <div key={item.title} className="min-w-[200px] flex-1">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[#A61B4D]">{item.title}</p>
                <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">{item.desc}</p>
              </div>
            ))}
          </div>
          <hr className="my-[2vw] border-t border-[#2a2a2a]" />
          <p className="mt-auto ml-auto max-w-[50ch] text-right text-[clamp(1rem,2.5vw,1.75rem)] font-normal leading-relaxed opacity-80">
            Enquanto você dorme, sua IA está fechando vendas.
          </p>
        </FlowSection>

        <FlowSection aria-label="Os resultados" style={{ backgroundColor: '#141414', color: '#fff' }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A61B4D]">03   Os resultados</p>
          <hr className="my-[2vw] border-t border-[#2a2a2a]" />
          <div>
            <h2 className="text-[clamp(3rem,10vw,11rem)] font-black leading-[0.85] uppercase tracking-tight">
              Mais<br />
              Vendas.<br />
              Menos<br />
              Trabalho.
            </h2>
          </div>
          <hr className="my-[2vw] border-t border-[#2a2a2a]" />
          <div className="flex flex-wrap gap-[3vw]">
            {[
              { value: '3x', label: 'Mais conversões', desc: 'Empresas que respondem em menos de 1 minuto convertem 3x mais.' },
              { value: '90%', label: 'Atendimento automático', desc: 'A grande maioria das dúvidas é resolvida pela IA sem precisar de você.' },
              { value: '10min', label: 'Para configurar', desc: 'Sem técnico, sem complicação. Você mesmo configura em minutos.' },
            ].map((item) => (
              <div key={item.label} className="min-w-[200px] flex-1">
                <p className="text-[clamp(2rem,5vw,4rem)] font-black text-[#A61B4D] leading-none">{item.value}</p>
                <p className="mb-2 text-sm font-bold uppercase tracking-wider mt-2">{item.label}</p>
                <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">{item.desc}</p>
              </div>
            ))}
          </div>
        </FlowSection>
      </FlowArt>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Planos e <span className="text-gradient">preços</span>
            </h2>
            <p className="text-gray-400 text-lg">Tudo que seu negócio precisa, em um único plano.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="card-glass rounded-2xl p-10 flex flex-col gap-6 border-[#A61B4D]/50 glow-wine relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="gradient-wine text-xs font-bold px-5 py-1.5 rounded-full tracking-wider">PLANO ÚNICO   TUDO INCLUSO</span>
              </div>
              <div className="text-center pt-2">
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-6xl font-black">R$ 499</span>
                  <span className="text-2xl font-bold text-gray-400 mb-2">,90<span className="text-base">/mês</span></span>
                </div>
                <p className="text-gray-400">Tudo que você precisa para automatizar seu atendimento de verdade</p>
              </div>
              <div className="border-t border-[#2a2a2a] pt-6 grid grid-cols-2 gap-3">
                {[
                  'Números ilimitados de WhatsApp',
                  'Mensagens ilimitadas',
                  'Chat ao vivo',
                  'Alertas de atendimento',
                  'Suporte prioritário',
                  'Onboarding dedicado',
                  'Cancele a qualquer momento',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-[#A61B4D] shrink-0">✓</span> {f}
                  </div>
                ))}
              </div>
              <a
                href="https://wa.me/5511923999249?text=Ol%C3%A1%21+Quero+contratar+o+ChatNex+por+R%24+499%2C90%2Fm%C3%AAs+e+automatizar+meu+atendimento%21"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wine py-4 rounded-xl font-bold text-base text-center glow-wine"
              >
                Quero contratar agora
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-8">
            Sem taxa de adesão · Cancele a qualquer momento · Suporte em português
          </p>
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
                a: 'Usamos a Evolution API, uma solução robusta que conecta seu WhatsApp via QR Code. Sem precisar de aprovação do Meta, sem complicação técnica.',
              },
              {
                q: 'Preciso saber programar para usar?',
                a: 'Não. O ChatNex foi desenvolvido para qualquer pessoa conseguir configurar. Em menos de 10 minutos seu atendimento já está funcionando.',
              },
              {
                q: 'A IA responde 24 horas por dia?',
                a: 'Sim! A IA funciona 24/7, respondendo automaticamente a qualquer hora. Você pode configurar horários de funcionamento se preferir que ela só responda em determinados períodos.',
              },
              {
                q: 'O que acontece quando a IA não sabe responder?',
                a: 'Ela avisa o cliente que vai verificar e envia um alerta para você no dashboard. Você assume o atendimento manualmente com um clique e o cliente nunca fica sem resposta.',
              },
              {
                q: 'Posso personalizar as respostas da IA?',
                a: 'Totalmente. Você configura a personalidade, produtos, preços, FAQ e regras de comportamento. A IA só responde dentro do contexto da sua empresa.',
              },
              {
                q: 'Há risco do meu número ser banido?',
                a: 'O risco existe em qualquer automação de WhatsApp. Recomendamos usar um número dedicado para o negócio (não seu número pessoal) e evitar envios em massa.',
              },
            ].map((item) => (
              <details key={item.q} className="card-glass rounded-xl group">
                <summary className="px-6 py-4 cursor-pointer font-medium flex items-center justify-between list-none">
                  {item.q}
                  <span className="text-[#A61B4D] text-lg shrink-0 ml-4">+</span>
                </summary>
                <p className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-glass rounded-2xl p-12 glow-wine">
            <div className="inline-flex items-center gap-2 bg-[#A61B4D]/10 border border-[#A61B4D]/30 rounded-full px-4 py-2 text-sm text-[#A61B4D] mb-6">
              <span className="w-2 h-2 bg-[#A61B4D] rounded-full animate-pulse" />
              Atendimento automatizado 24 horas por dia
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Seu concorrente já pode<br />
              estar usando. <span className="text-gradient">E você?</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Enquanto você pensa, sua IA poderia estar fechando vendas. Comece agora em menos de 10 minutos.
            </p>
            <a
              href="https://wa.me/5511923999249?text=Ol%C3%A1%21+Quero+contratar+o+ChatNex+agora+e+automatizar+meu+atendimento+24h%21+Vamos+come%C3%A7ar%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wine px-10 py-4 rounded-xl text-base font-semibold inline-block glow-wine"
            >
              Automatizar meu WhatsApp agora
            </a>
            <p className="text-xs text-gray-600 mt-4">Sem cartão de crédito · Cancele quando quiser · Suporte em português</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded gradient-wine flex items-center justify-center text-xs font-bold">CN</div>
              <span className="font-bold text-lg">ChatNex</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#features" className="hover:text-white transition-colors">Recursos</a>
              <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
            <p className="text-sm text-gray-600">
              © 2026 ChatNex · Desenvolvido pela{' '}
              <a
                href="https://instagram.com/agencynodex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A61B4D] hover:text-white transition-colors underline underline-offset-2"
              >
                Nodex
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
