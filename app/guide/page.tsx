"use client";

import Link from "next/link";

function Section({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <section className="glass-hybe rounded-2xl p-6 sm:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
      </div>
      <div className="space-y-3 text-neutral-300 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-sm text-violet-300">
      💡 <strong>Tip:</strong> {children}
    </div>
  );
}

function Term({ word, children }: { word: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
      <span className="text-white font-bold">{word}:</span>{" "}
      <span className="text-neutral-400">{children}</span>
    </div>
  );
}

function Shortcut({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
      <span className="text-neutral-400 text-sm">{desc}</span>
      <kbd className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs font-mono text-violet-300">{keys}</kbd>
    </div>
  );
}

export default function GuidePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 100 24" className="h-4 text-white" fill="currentColor">
            <text x="0" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="3">HYBE</text>
          </svg>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Guía de Usuario</span>
        </div>
        <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg border border-white/[0.06]">
          ← Volver al Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight sb-gradient">Guía de Usuario</h1>
          <p className="text-lg text-neutral-400">Santos Bravos — Artist Intelligence Dashboard</p>
          <p className="text-sm text-neutral-600">Explicado de la manera más sencilla posible 🎯</p>
        </div>

        {/* What is this */}
        <Section emoji="🏠" title="¿Qué es este dashboard?">
          <p>
            Imagina que tienes un <strong className="text-white">tablero mágico</strong> que te dice TODO lo que está pasando con Santos Bravos en internet. Cuánta gente los escucha, cuánta gente habla de ellos, en qué países son más populares... todo en un solo lugar.
          </p>
          <p>
            En vez de abrir Spotify, luego YouTube, luego Instagram, luego Twitter... este dashboard junta <strong className="text-white">todos esos números</strong> y te los presenta bonito, con gráficas y colores para que entiendas al instante cómo les va.
          </p>
          <Tip>Puedes instalar el dashboard como app en tu celular. En iPhone: abre en Safari → botón Compartir → &quot;Agregar a pantalla de inicio&quot;. En Android: Chrome te mostrará un banner &quot;Instalar app&quot;.</Tip>
        </Section>

        {/* Navigation */}
        <Section emoji="🧭" title="¿Cómo me muevo por el dashboard?">
          <p>
            Hay varias formas de navegar — usa la que te resulte más cómoda:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Barra de scroll (arriba)</strong> — La barra delgada en la parte superior muestra tu progreso. Si pasas el mouse por encima, se expande y muestra marcadores de cada sección — haz click en cualquiera para saltar.</li>
            <li><strong className="text-white">Sidebar flotante (derecha, desktop)</strong> — Botoncitos con iconos a la derecha de la pantalla. Cada uno te lleva a una sección. Los puntitos de color te dicen si esa sección va bien (verde) o necesita atención (rojo).</li>
            <li><strong className="text-white">Barra inferior (celular)</strong> — En pantallas chicas aparece una barra de tabs abajo, como una app. Desliza para ver todas las secciones.</li>
            <li><strong className="text-white">Command Palette</strong> — Presiona <kbd className="bg-white/[0.06] border border-white/[0.1] rounded px-1.5 py-0.5 text-xs font-mono text-violet-300">⌘K</kbd> (Mac) o <kbd className="bg-white/[0.06] border border-white/[0.1] rounded px-1.5 py-0.5 text-xs font-mono text-violet-300">Ctrl+K</kbd> (Windows) para buscar cualquier sección, métrica o acción.</li>
          </ul>
          <Tip>Puedes compartir un link directo a una sección específica. El URL se actualiza automáticamente con la sección visible — ejemplo: <code className="text-violet-400">?date=2026-02-09#pr</code> lleva directo a PR & Media del 9 de febrero.</Tip>
        </Section>

        {/* Date Navigation */}
        <Section emoji="📅" title="Navegar entre fechas">
          <p>
            En la barra de navegación hay un <strong className="text-white">selector de fecha</strong> con flechas. Puedes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Flechas ← →</strong> — Navegar día por día al reporte anterior o siguiente</li>
            <li><strong className="text-white">Click en la fecha</strong> — Abrir un dropdown con todas las fechas disponibles</li>
            <li><strong className="text-white">Atajos de teclado</strong> — <kbd className="bg-white/[0.06] border border-white/[0.1] rounded px-1.5 py-0.5 text-xs font-mono text-violet-300">[</kbd> fecha anterior, <kbd className="bg-white/[0.06] border border-white/[0.1] rounded px-1.5 py-0.5 text-xs font-mono text-violet-300">]</kbd> fecha siguiente</li>
          </ul>
          <p>
            Los datos se almacenan en Supabase, así que cada reporte diario queda guardado y puedes regresar a ver cualquier día anterior.
          </p>
        </Section>

        {/* Hero Section */}
        <Section emoji="⭐" title="La tarjeta principal (Hero)">
          <p>
            Lo primero que ves es la <strong className="text-white">tarjeta grande con la foto de Santos Bravos</strong>. Aquí tienes el resumen ejecutivo — los 4 números más importantes de un vistazo:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Term word="Listeners">Cuántas personas escucharon a Santos Bravos en Spotify este mes. Más = mejor.</Term>
            <Term word="SNS">Total de seguidores sumando TODAS las redes sociales (Spotify, YouTube, TikTok, Instagram, Weverse).</Term>
            <Term word="Streams">Total de reproducciones en TODAS las plataformas (Spotify + YouTube + TikTok audio).</Term>
            <Term word="SPL">Streams Per Listener — en promedio, cuántas veces cada persona escuchó sus canciones. Si es alto (6+), la gente repite mucho = les encanta.</Term>
          </div>
          <p>
            Cada tarjeta también muestra: una <strong className="text-white">barrita de progreso</strong> hacia el milestone estratégico (ej. &quot;67% → 500K&quot;), la <strong className="text-white">velocidad diaria</strong> de crecimiento (+X/día), y una <strong className="text-white">sparkline</strong> mostrando la tendencia.
          </p>
          <p>
            Arriba de las tarjetas hay un <strong className="text-white">badge rotativo</strong> que muestra la métrica con mayor crecimiento, y una <strong className="text-white">línea ejecutiva (TL;DR)</strong> que resume todo en una oración.
          </p>
        </Section>

        {/* Key Highlights */}
        <Section emoji="🔑" title="Key Highlights (Resumen ejecutivo)">
          <p>
            Esta sección es como el <strong className="text-white">resumen de una página</strong>. Muestra los logros más importantes del día en tarjetas con íconos de colores:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li>Los <strong className="text-emerald-400">números verdes</strong> significan que algo creció (¡bien!)</li>
            <li>Los <strong className="text-red-400">números rojos</strong> significan que algo bajó (hay que ponerle ojo)</li>
            <li>Cada tarjeta tiene un <strong className="text-white">porcentaje de cambio</strong> — te dice cuánto subió o bajó comparado con el reporte anterior</li>
          </ul>
          <p>
            Debajo hay un <strong className="text-white">Analyst Note</strong> (nota del analista) — un párrafo en prosa que resume la situación como lo haría un analista humano.
          </p>
          <Tip>Si tu jefe te pide &quot;¿cómo van Santos Bravos?&quot; — esta sección es lo que le enseñas. Tiene todo lo importante en 30 segundos.</Tip>
        </Section>

        {/* Notable Changes & Wins */}
        <Section emoji="🏆" title="Notable Changes, Weekly Wins & Risk Radar">
          <p>
            Tres secciones complementarias que te ahorran análisis:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Notable Changes</strong> — Las métricas que más cambiaron ({">"}3%). Ordenadas por magnitud. Click en cualquiera te lleva a su sección.</li>
            <li><strong className="text-emerald-400">Weekly Wins</strong> — Logros automáticos: milestones cruzados, crecimientos récord, engagement excepcional. Son las &quot;buenas noticias&quot; que puedes compartir.</li>
            <li><strong className="text-red-400">Risk Radar</strong> — Alertas automáticas: métricas en declive, sentimiento negativo alto, concentración geográfica. Son las &quot;banderas rojas&quot; que necesitan atención.</li>
          </ul>
        </Section>

        {/* Growth Velocity */}
        <Section emoji="📊" title="Growth Velocity & Historical Trends">
          <p>
            <strong className="text-white">Growth Velocity</strong> muestra barras horizontales con el % de crecimiento de cada métrica, organizadas por color:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-green-400">Verde (Spotify)</strong> — Streams y listeners</li>
            <li><strong className="text-red-400">Rojo (YouTube)</strong> — Views de videos</li>
            <li><strong className="text-cyan-400">Cyan (SNS)</strong> — Seguidores en redes</li>
          </ul>
          <p>
            <strong className="text-white">Historical Trends</strong> muestra una línea de tiempo con TODAS las fechas disponibles, para ver la trayectoria completa de listeners, streams, SNS y followers.
          </p>
        </Section>

        {/* Section 1 */}
        <Section emoji="1️⃣" title="Business Performance Snapshot">
          <p>
            La sección más <strong className="text-white">detallada con números</strong>. Muestra cada métrica en filas:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Spotify Monthly Listeners & Followers</strong></li>
            <li><strong className="text-white">Spotify Streams por canción</strong> (0%, 0% PT, KAWASAKI)</li>
            <li><strong className="text-white">YouTube Views por video</strong> + engagement (likes, comments, rate)</li>
            <li><strong className="text-white">Total Cross-Platform Streams</strong></li>
          </ul>
          <p>Cada fila muestra: valor actual · valor anterior · cambio absoluto · % de cambio</p>
          <p>
            Debajo está <strong className="text-white">Stream Projections</strong> — tres tarjetas mostrando la velocidad diaria de streams por canción, cuándo alcanzarán su siguiente milestone, y si están acelerando o desacelerando.
          </p>
        </Section>

        {/* Daily Snapshot */}
        <Section emoji="⚡" title="Spotify for Artists — Daily Snapshot">
          <p>
            Números de <strong className="text-white">un solo día</strong> (las últimas 24 horas):
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-green-400">Streams</strong> — Reproducciones ese día</li>
            <li><strong className="text-white">Listeners</strong> — Personas diferentes que escucharon</li>
            <li><strong className="text-violet-400">Saves</strong> — Personas que guardaron la canción</li>
          </ul>
          <p>
            También incluye <strong className="text-white">Engagement Depth</strong> — indicadores de calidad como el ratio streams/listener (replay depth) y save rate por canción.
          </p>
          <Tip>Los &quot;Saves&quot; son super importantes — significan que alguien le gustó tanto la canción que la guardó. Es señal de fans reales.</Tip>
        </Section>

        {/* Charts */}
        <Section emoji="📈" title="Streaming Charts & Analysis">
          <p>
            Varias visualizaciones de streaming:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Bar Charts</strong> — Barras comparando streams por track y YouTube views por video, con valores inline</li>
            <li><strong className="text-white">Platform Distribution</strong> — Donut mostrando % de Spotify vs YouTube vs TikTok</li>
            <li><strong className="text-white">Content Efficiency</strong> — Streams por día desde el lanzamiento de cada track (normaliza por edad)</li>
            <li><strong className="text-white">Release Pacing</strong> — Curvas de crecimiento acumulado desde Day 0 para comparar trayectorias</li>
            <li><strong className="text-white">Spotify Player</strong> — Reproductor embebido para escuchar las canciones directamente</li>
          </ul>
        </Section>

        {/* Section 2 */}
        <Section emoji="2️⃣" title="Social Media Performance">
          <p>
            Tarjetas visuales para cada plataforma con seguidores, sparkline de tendencia, y % del total:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li>Spotify Followers · YouTube Subscribers · TikTok Followers · Instagram Followers · Weverse Members</li>
          </ul>
          <p>
            El <strong className="text-white">Total Social Footprint</strong> es la suma de TODAS las plataformas.
          </p>
        </Section>

        {/* Section 3 */}
        <Section emoji="3️⃣" title="Audio Virality">
          <p>
            ¿La gente está usando las canciones en TikTok e Instagram?
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Audio Views</strong> — Vistas de videos que usan el audio</li>
            <li><strong className="text-cyan-400">TikTok Creates</strong> — TikToks hechos con la canción</li>
            <li><strong className="text-pink-400">IG Creates</strong> — Reels de Instagram con la canción</li>
          </ul>
          <p>
            El <strong className="text-white">Virality Ratio</strong> muestra creates por cada 1,000 streams — revela qué canción es más viral relativa a su audiencia.
          </p>
          <Tip>Si los &quot;Creates&quot; están subiendo, la canción se está volviendo viral. La gente la usa para su propio contenido — eso es ORO en marketing musical.</Tip>
        </Section>

        {/* Track Comparison */}
        <Section emoji="🎯" title="Track Comparison (Radar)">
          <p>
            Un <strong className="text-white">gráfico de radar</strong> que compara las 3 canciones en 5 dimensiones: streams totales, streams diarios, TikTok creates, IG creates, y saves. Cada canción tiene su &quot;huella&quot; — puedes ver de un vistazo dónde domina cada una.
          </p>
        </Section>

        {/* Section 4 */}
        <Section emoji="4️⃣" title="Band Member Followers">
          <p>
            Tarjetas individuales por miembro con seguidores de Instagram, % del total, y ranking. <strong className="text-white">Click en cualquier tarjeta</strong> abre su perfil de Instagram.
          </p>
          <p>
            El <strong className="text-white">Member Buzz</strong> compara seguidores vs menciones en medios — revela quién genera más conversación relativa a sus seguidores.
          </p>
        </Section>

        {/* Section 5 */}
        <Section emoji="5️⃣" title="Geo Signals (Señales geográficas)">
          <p>
            ¿En qué países y ciudades escuchan más a Santos Bravos?
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Treemap</strong> — Rectángulos proporcionales al tamaño de cada mercado</li>
            <li><strong className="text-white">Regional Breakdown</strong> — Agrupado en LATAM Core, LATAM Growth e International</li>
            <li><strong className="text-white">Reach Diversity</strong> — Índice circular que mide qué tan diversificada está la audiencia</li>
            <li><strong className="text-white">Market Penetration</strong> — Listeners como % de la población de cada país (revela dónde hay oportunidad)</li>
            <li><strong className="text-white">Top Countries & Cities</strong> — Rankings con barras de progreso</li>
          </ul>
          <Tip>El Market Penetration es clave: un país con muchos listeners pero baja penetración (como Brasil) es una oportunidad enorme de crecimiento.</Tip>
        </Section>

        {/* Audience */}
        <Section emoji="🎧" title="Audience Deep Dive">
          <p>
            Datos de <strong className="text-white">Spotify for Artists</strong> en 28 días:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Term word="Listeners">Personas únicas que escucharon al menos una canción</Term>
            <Term word="Streams / Listener">Promedio de veces que cada persona escuchó. Arriba de 5 = fans comprometidos</Term>
            <Term word="Save Rate">% de streams que se convierten en saves. Arriba de 3.5% = excelente</Term>
            <Term word="Follower Conversion">% de listeners que se hacen followers. Arriba de 20% = excepcional</Term>
          </div>
          <p>
            Incluye un <strong className="text-white">Audience Funnel</strong> (embudo) y un <strong className="text-white">Health Scorecard</strong> comparando contra benchmarks de la industria.
          </p>
        </Section>

        {/* Section 6 */}
        <Section emoji="6️⃣" title="PR & Media Exposure">
          <p>
            Datos de <strong className="text-white">Meltwater</strong> (monitoreo de medios):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Term word="Total Mentions">Veces que se mencionó a Santos Bravos en noticias, blogs y redes</Term>
            <Term word="Unique Authors">Personas diferentes que hablaron de ellos</Term>
            <Term word="Share of Voice">% de la conversación de HYBE Latin America que Santos Bravos captura</Term>
          </div>
          <p className="mt-2">Visualizaciones:</p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Daily Mention Volume</strong> — Gráfica de menciones por día. Picos = algo pasó</li>
            <li><strong className="text-white">WoW Comparison</strong> — Esta semana vs la anterior</li>
            <li><strong className="text-white">Mention Momentum</strong> — ¿Acelerando o desacelerando?</li>
            <li><strong className="text-white">Source Distribution</strong> — Donut: ¿de dónde vienen las menciones?</li>
            <li><strong className="text-white">Media vs Audience Geography</strong> — Compara dónde se habla de ellos vs dónde se escuchan</li>
            <li><strong className="text-white">Weekday Heatmap</strong> — ¿Qué día de la semana genera más conversación?</li>
            <li><strong className="text-white">Top Sources, Countries, Cities, Languages, Topics, Influencers, Keyphrases</strong></li>
          </ul>
          <Tip>Si ves un pico grande en menciones, pregúntate: &quot;¿qué pasó ese día?&quot; Probablemente lanzaron algo o se viralizó un contenido.</Tip>
        </Section>

        {/* Section 7 */}
        <Section emoji="7️⃣" title="Fan Sentiment & Conversation">
          <p>
            ¿Qué siente la gente cuando habla de Santos Bravos?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Term word="😊 Positive">Elogios, emoción, amor</Term>
            <Term word="😐 Neutral">Noticias, datos, info sin opinión fuerte</Term>
            <Term word="😟 Negative">Críticas, quejas</Term>
          </div>
          <ul className="list-disc list-inside space-y-2 text-neutral-400 mt-3">
            <li><strong className="text-white">Net Sentiment Score</strong> — Medidor tipo velocímetro. Derecha (verde) = positivo. Izquierda (rojo) = negativo.</li>
            <li><strong className="text-white">Sentiment Timeline</strong> — Gráfica de área mostrando cómo cambia el sentimiento día a día</li>
            <li><strong className="text-white">Top Hashtags</strong> — Click en cualquiera abre la búsqueda en X/Twitter</li>
            <li><strong className="text-white">Conversation Drivers</strong> — Personas y organizaciones más mencionadas</li>
            <li><strong className="text-white">Most Shared Links</strong> — Los links que más comparte la gente</li>
          </ul>
          <Tip>Sentimiento positivo arriba de 30% es bueno para un artista nuevo. Lo que quieres evitar es que el negativo suba arriba de 20%.</Tip>
        </Section>

        {/* Section 8 */}
        <Section emoji="8️⃣" title="Cultural Affinity">
          <p>
            ¿Cómo conecta Santos Bravos con la cultura más amplia? Esta sección analiza temas culturales mencionados junto con Santos Bravos: K-pop crossover, Latin pop, baile, moda, etc.
          </p>
          <p>
            Útil para entender qué <strong className="text-white">territorios culturales</strong> ocupa la marca en el imaginario público.
          </p>
        </Section>

        {/* Keyboard shortcuts */}
        <Section emoji="⌨️" title="Atajos de teclado">
          <p>Para usuarios avanzados — funciona en desktop:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Shortcut keys="⌘K / Ctrl+K" desc="Búsqueda rápida (Command Palette)" />
            <Shortcut keys="1 — 7" desc="Saltar a sección 1-7" />
            <Shortcut keys="H" desc="Ir al inicio" />
            <Shortcut keys="M" desc="Ir a Milestones" />
            <Shortcut keys="R" desc="Refrescar datos en vivo" />
            <Shortcut keys="P" desc="Imprimir / Exportar PDF" />
            <Shortcut keys="E" desc="Expandir / colapsar todas las secciones" />
            <Shortcut keys="[ ]" desc="Fecha anterior / siguiente" />
            <Shortcut keys="?" desc="Ver todos los atajos" />
          </div>
        </Section>

        {/* Export */}
        <Section emoji="📤" title="Exportar y compartir">
          <p>
            En la barra de navegación hay varios botones de exportación:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">📋 Summary</strong> — Copia un resumen ejecutivo en texto al portapapeles. Ideal para pegar en emails o Slack.</li>
            <li><strong className="text-white">🖨️ PDF</strong> — Imprime el dashboard completo como PDF con fondo blanco optimizado para lectura.</li>
            <li><strong className="text-white">📊 CSV</strong> — Descarga todos los datos como archivo de Excel/CSV para tus propios análisis.</li>
            <li><strong className="text-white">📱 Share</strong> — Envía un snippet rápido por WhatsApp, Telegram o X con los números clave y el link del dashboard.</li>
          </ul>
          <Tip>El link del dashboard incluye la fecha seleccionada automáticamente, así que quien lo abra verá exactamente el mismo reporte que tú.</Tip>
        </Section>

        {/* Focus Mode */}
        <Section emoji="🔍" title="Funciones especiales">
          <ul className="list-disc list-inside space-y-3 text-neutral-400">
            <li><strong className="text-white">Focus Mode</strong> — Pasa el mouse sobre el título de cualquier sección y aparece un ícono ⛶. Click para ver esa sección a pantalla completa — ideal para presentaciones y screen sharing.</li>
            <li><strong className="text-white">Secciones colapsables</strong> — Click en el título de cualquier sección para expandir/colapsar. Las secciones colapsadas muestran un resumen de una línea con los datos clave.</li>
            <li><strong className="text-white">Auto-refresh</strong> — Los datos de APIs (Chartmetric, YouTube, Meltwater) se actualizan automáticamente cada 5 minutos. El countdown aparece junto al indicador LIVE.</li>
            <li><strong className="text-white">Data Freshness</strong> — Si los datos del reporte tienen más de 12 horas, aparece un banner amarillo/naranja/rojo avisándote.</li>
            <li><strong className="text-white">Metric Tooltips</strong> — ¿No entiendes una métrica? Busca el ícono ⓘ junto al nombre — hover para ver la explicación.</li>
          </ul>
        </Section>

        {/* Glossary */}
        <Section emoji="📖" title="Glosario rápido">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Term word="DoD">Day-over-Day — Comparación de un día vs el anterior</Term>
            <Term word="WoW">Week-over-Week — Comparación de una semana vs la anterior</Term>
            <Term word="SPL">Streams Per Listener — Reproducciones promedio por persona</Term>
            <Term word="SOV">Share of Voice — % de la conversación total que captura Santos Bravos</Term>
            <Term word="NSS">Net Sentiment Score — Positivo% menos Negativo% (-100 a +100)</Term>
            <Term word="Eng. Rate">Engagement Rate — % de gente que interactúa (likes + comments / views)</Term>
            <Term word="Creates">Videos que la gente hace usando el audio de una canción</Term>
            <Term word="Audio Views">Vistas de videos que usan el audio del artista</Term>
            <Term word="Footprint">Huella digital — presencia total en redes sociales</Term>
            <Term word="Sentiment">Análisis automático de si lo que dicen es positivo, negativo o neutral</Term>
            <Term word="Mentions">Cada vez que alguien nombra a Santos Bravos en internet</Term>
            <Term word="Unique Authors">Personas diferentes (no cuentas repetidas) que hablaron del tema</Term>
            <Term word="HHI">Herfindahl-Hirschman Index — Medida de concentración de mercado</Term>
            <Term word="CR3">Concentration Ratio (Top 3) — % del total que representan los 3 mercados más grandes</Term>
          </div>
        </Section>

        {/* FAQ */}
        <Section emoji="❓" title="Preguntas frecuentes">
          <div className="space-y-4">
            <div>
              <p className="text-white font-bold">¿Cada cuánto se actualizan los datos?</p>
              <p className="text-neutral-400">Las APIs (Chartmetric, YouTube, Meltwater) se refrescan automáticamente cada 5 minutos cuando el dashboard está abierto. Los datos de Spotify for Artists, Cobrand e Instagram requieren scraping manual.</p>
            </div>
            <div>
              <p className="text-white font-bold">¿Puedo ver datos de días anteriores?</p>
              <p className="text-neutral-400">¡Sí! Usa el selector de fecha en la barra de navegación o las flechas ← → para navegar entre reportes. Todos los reportes se guardan en Supabase.</p>
            </div>
            <div>
              <p className="text-white font-bold">¿Qué significan los colores verde y rojo en los números?</p>
              <p className="text-neutral-400">Verde = creció respecto al reporte anterior. Rojo = bajó. Así de simple.</p>
            </div>
            <div>
              <p className="text-white font-bold">¿Puedo compartir el dashboard?</p>
              <p className="text-neutral-400">El dashboard requiere login con Google (cuentas autorizadas). Usa los botones de exportación (Summary, PDF, CSV, Share) para compartir los datos con quien no tenga acceso.</p>
            </div>
            <div>
              <p className="text-white font-bold">¿Qué hago si una sección muestra error?</p>
              <p className="text-neutral-400">Cada sección tiene su propio error boundary — si una falla, las demás siguen funcionando. Click &quot;Retry&quot; en la sección con error, o recarga la página.</p>
            </div>
            <div>
              <p className="text-white font-bold">¿Funciona sin internet?</p>
              <p className="text-neutral-400">El dashboard necesita internet para cargar datos. Pero si lo instalas como PWA y ya cargó, puedes ver los últimos datos cargados sin conexión.</p>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="text-center py-10 border-t border-white/[0.03] space-y-3">
          <Link href="/" className="inline-block text-sm text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 hover:bg-violet-500/20 px-6 py-3 rounded-xl border border-violet-500/20 font-bold">
            ← Ir al Dashboard
          </Link>
          <p className="text-neutral-700 text-[10px] uppercase tracking-[0.3em] mt-4">HYBE Latin America · Artist Intelligence Platform</p>
        </footer>
      </div>
    </main>
  );
}
