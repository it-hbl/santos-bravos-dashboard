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
          <Tip>Puedes acceder al dashboard desde cualquier dispositivo — computadora, tablet o celular. Solo abre el link en tu navegador.</Tip>
        </Section>

        {/* Navigation */}
        <Section emoji="🧭" title="¿Cómo me muevo por el dashboard?">
          <p>
            Arriba del todo hay una <strong className="text-white">barra de navegación</strong> (la barra oscura que dice HYBE). Ahí puedes ver:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">La fecha del reporte</strong> — te dice de qué día son los datos (ej: 📅 Report: 2/9/2026)</li>
            <li><strong className="text-white">El indicador LIVE</strong> — un puntito verde que te dice si los datos están actualizados</li>
          </ul>
          <p>
            Debajo hay <strong className="text-white">botones con los nombres de cada sección</strong>. Si le das click a uno, te lleva directo a esa parte. Es como un índice — no tienes que scrollear buscando.
          </p>
          <Tip>En celular los botones se deslizan horizontalmente. Desliza con el dedo para ver todos.</Tip>
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
          <Tip>Si tu jefe te pide "¿cómo van Santos Bravos?" — esta sección es lo que le enseñas. Tiene todo lo importante en 30 segundos.</Tip>
        </Section>

        {/* Growth Velocity */}
        <Section emoji="📊" title="Growth Velocity (Velocidad de crecimiento)">
          <p>
            Aquí ves <strong className="text-white">barras horizontales</strong> que muestran qué tan rápido está creciendo cada métrica. Las barras más largas = crecimiento más rápido.
          </p>
          <p>
            Están organizadas por colores:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-green-400">Verde (Spotify)</strong> — Streams y listeners en Spotify</li>
            <li><strong className="text-red-400">Rojo (YouTube)</strong> — Views de videos en YouTube</li>
            <li><strong className="text-cyan-400">Cyan (SNS)</strong> — Seguidores en redes sociales</li>
          </ul>
          <p>
            Esto te ayuda a ver de un vistazo: <em>"¿Dónde estamos creciendo más rápido? ¿Dónde nos estamos quedando?"</em>
          </p>
        </Section>

        {/* Section 1 */}
        <Section emoji="1️⃣" title="Business Performance Snapshot">
          <p>
            Esta es la sección más <strong className="text-white">detallada con números</strong>. Muestra cada métrica en filas, como una tabla:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Spotify Monthly Listeners</strong> — Oyentes mensuales en Spotify</li>
            <li><strong className="text-white">Spotify Streams por canción</strong> — Cuántas veces se ha reproducido cada track (0%, 0% PT, KAWASAKI)</li>
            <li><strong className="text-white">YouTube Views por video</strong> — Cuántas vistas tiene cada video oficial</li>
            <li><strong className="text-white">Total Cross-Platform Streams</strong> — La suma de TODO (Spotify + YouTube + Audio Views)</li>
          </ul>
          <p>Cada fila te muestra 4 cosas:</p>
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] font-mono text-xs space-y-1">
            <p><span className="text-neutral-500">Nombre</span> · <span className="text-white">Valor actual</span> · <span className="text-neutral-600">Valor anterior</span> · <span className="text-emerald-400">+Cambio</span> · <span className="text-emerald-400">+%</span></p>
          </div>
          <p>
            <strong className="text-white">YouTube Engagement</strong>: Debajo de los videos aparecen tarjetas con likes, comentarios y "Engagement Rate". 
            El Eng. Rate te dice qué porcentaje de la gente que vio el video interactuó (dio like o comentó). 
            Arriba de 5% es <strong className="text-emerald-400">excelente</strong>, 3-5% es <strong className="text-amber-400">bueno</strong>.
          </p>
        </Section>

        {/* Daily Snapshot */}
        <Section emoji="⚡" title="Spotify for Artists — Daily Snapshot">
          <p>
            Esta sección muestra los números de <strong className="text-white">un solo día</strong> (las últimas 24 horas). Tiene una tarjeta para cada canción con:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-green-400">Streams</strong> — Cuántas veces se reprodujo la canción ese día</li>
            <li><strong className="text-white">Listeners</strong> — Cuántas personas diferentes la escucharon</li>
            <li><strong className="text-violet-400">Saves</strong> — Cuántas personas la guardaron en su biblioteca</li>
          </ul>
          <Tip>Los "Saves" son super importantes — significan que alguien le gustó tanto la canción que la guardó para escucharla después. Es señal de que se vuelven fans reales.</Tip>
        </Section>

        {/* Charts */}
        <Section emoji="📈" title="Las gráficas interactivas">
          <p>
            Debajo del daily snapshot hay <strong className="text-white">gráficas de barras</strong> que comparan visualmente:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Streams por track</strong> — Barras verdes mostrando qué canción tiene más streams acumulados</li>
            <li><strong className="text-white">YouTube Views por video</strong> — Barras rojas comparando videos</li>
            <li><strong className="text-white">Daily Streams</strong> — Barras moradas del último día</li>
          </ul>
          <p>
            También hay una gráfica de <strong className="text-white">Platform Distribution</strong> — un círculo (donut) que muestra qué porcentaje del total viene de Spotify, YouTube o TikTok/IG audio.
          </p>
        </Section>

        {/* Section 2 */}
        <Section emoji="2️⃣" title="Social Media Performance">
          <p>
            Aquí ves los <strong className="text-white">seguidores en cada red social</strong>:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li>Spotify Followers</li>
            <li>YouTube Subscribers</li>
            <li>TikTok Followers</li>
            <li>Instagram Followers</li>
            <li>Weverse Members</li>
          </ul>
          <p>
            El número grande de arriba es el <strong className="text-white">Total Social Footprint</strong> — la suma de seguidores en TODAS las plataformas. Es como decir: "¿cuánta gente en total nos sigue en internet?"
          </p>
          <p>
            La gráfica de barras te deja comparar de un vistazo qué plataforma tiene más seguidores.
          </p>
        </Section>

        {/* Section 3 */}
        <Section emoji="3️⃣" title="Audio Virality">
          <p>
            Esta sección mide qué tanto se están usando las canciones como <strong className="text-white">audio en TikTok e Instagram</strong>. Es decir: ¿la gente está haciendo videos con sus canciones?
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Audio Views</strong> — Cuántas veces se vieron videos que usan el audio de Santos Bravos</li>
            <li><strong className="text-cyan-400">TikTok Creates</strong> — Cuántos TikToks se han hecho con esa canción</li>
            <li><strong className="text-pink-400">IG Creates</strong> — Cuántos Reels de Instagram se han hecho con esa canción</li>
          </ul>
          <Tip>Si los "Creates" están subiendo, significa que la canción se está volviendo viral. La gente la está usando para hacer su propio contenido — eso es ORO en marketing musical.</Tip>
        </Section>

        {/* Section 4 */}
        <Section emoji="4️⃣" title="Band Member Followers">
          <p>
            Cada miembro de Santos Bravos tiene su <strong className="text-white">tarjeta individual</strong> con:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li>Su bandera de país 🇲🇽 🇧🇷</li>
            <li>Su handle de Instagram (@usuario)</li>
            <li>Su número de seguidores</li>
            <li>Una barrita que muestra qué porcentaje del total representa</li>
          </ul>
          <p>
            Están ordenados del que tiene <strong className="text-white">más seguidores al que tiene menos</strong>. Abajo hay un total sumado.
          </p>
          <p>
            Si le das <strong className="text-white">click a la tarjeta</strong> de cualquier miembro, te abre su perfil de Instagram directamente.
          </p>
        </Section>

        {/* Section 5 */}
        <Section emoji="5️⃣" title="Geo Signals (Señales geográficas)">
          <p>
            ¿En qué países y ciudades escuchan más a Santos Bravos? Esta sección te lo dice:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Top Countries</strong> — Los 10 países con más listeners, con banderas y barras de progreso</li>
            <li><strong className="text-white">Top Cities</strong> — Las ciudades específicas donde más se escuchan</li>
          </ul>
          <p>
            Las tarjetas de arriba te resumen: cuántos países, cuál es el mercado #1, y cuántos listeners suman los top 10.
          </p>
          <Tip>Esto es clave para planear giras y eventos. Si México tiene el 30% de los listeners, ahí es donde hay que hacer el primer concierto.</Tip>
        </Section>

        {/* Audience */}
        <Section emoji="🎧" title="Audience Deep Dive">
          <p>
            Datos profundos de <strong className="text-white">Spotify for Artists</strong> en un período de 28 días:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Term word="Listeners">Personas únicas que escucharon al menos una canción</Term>
            <Term word="Streams">Total de reproducciones en el período</Term>
            <Term word="Streams / Listener">Promedio de veces que cada persona escuchó. Arriba de 5 = fans comprometidos</Term>
            <Term word="Saves">Gente que guardó canciones en su biblioteca</Term>
            <Term word="Playlist Adds">Veces que alguien agregó una canción a su playlist</Term>
            <Term word="Followers">Personas que siguen al artista en Spotify (reciben notificaciones de nueva música)</Term>
          </div>
        </Section>

        {/* Section 6 */}
        <Section emoji="6️⃣" title="PR & Media Exposure">
          <p>
            Esta sección usa datos de <strong className="text-white">Meltwater</strong> (una herramienta de monitoreo de medios) para medir cuánto se habla de Santos Bravos en internet:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Term word="Total Mentions">Cuántas veces se mencionó a Santos Bravos en noticias, blogs y redes sociales</Term>
            <Term word="Avg / Day">Promedio de menciones por día</Term>
            <Term word="Unique Authors">Cuántas personas diferentes hablaron de ellos (no es lo mismo que 1 persona publique 100 tweets a que 100 personas publiquen 1)</Term>
          </div>
          <p className="mt-2">Debajo tienes:</p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Daily Mention Volume</strong> — Una gráfica de barras mostrando cuántas menciones hubo cada día. Los picos = algo pasó ese día (lanzamiento, noticia viral, etc.)</li>
            <li><strong className="text-white">Source Distribution</strong> — Un círculo que muestra de DÓNDE vienen las menciones (Twitter, Instagram, noticias, blogs...)</li>
            <li><strong className="text-white">Top Countries</strong> — En qué países se habla más de ellos</li>
            <li><strong className="text-white">Top Sources</strong> — Las plataformas específicas con más menciones</li>
            <li><strong className="text-white">Trending Keyphrases</strong> — Las frases más usadas cuando hablan de Santos Bravos</li>
          </ul>
          <Tip>Si ves un pico grande en el gráfico de menciones diarias, pregúntate: "¿qué pasó ese día?" Probablemente lanzaron algo, salieron en algún medio, o se viralizó algo.</Tip>
        </Section>

        {/* Section 7 */}
        <Section emoji="7️⃣" title="Fan Sentiment & Conversation">
          <p>
            La sección más interesante: <strong className="text-white">¿qué siente la gente cuando habla de Santos Bravos?</strong> También viene de Meltwater.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Term word="😊 Positive">Menciones con sentimiento positivo — elogios, emoción, amor</Term>
            <Term word="😐 Neutral">Menciones informativas sin opinión fuerte — noticias, datos</Term>
            <Term word="😟 Negative">Menciones con sentimiento negativo — críticas, quejas</Term>
          </div>
          <p className="mt-2">Las visualizaciones incluyen:</p>
          <ul className="list-disc list-inside space-y-2 text-neutral-400">
            <li><strong className="text-white">Net Sentiment Score</strong> — Un medidor como velocímetro. Si la aguja está a la derecha (verde), el sentimiento general es positivo. A la izquierda (rojo), es negativo.</li>
            <li><strong className="text-white">Sentiment Breakdown</strong> — Donut con los porcentajes de positivo/neutral/negativo</li>
            <li><strong className="text-white">Top Hashtags</strong> — Los hashtags más usados en Twitter cuando hablan de Santos Bravos</li>
            <li><strong className="text-white">Conversation Drivers</strong> — Las personas, organizaciones y lugares que más aparecen en las conversaciones</li>
            <li><strong className="text-white">Most Shared Links</strong> — Los links que la gente más comparte cuando habla de Santos Bravos</li>
          </ul>
          <Tip>Un sentimiento positivo arriba de 30% es bueno para un artista nuevo. Lo normal es que la mayoría sea neutral (noticias, info). Lo que quieres evitar es que el negativo suba arriba de 20%.</Tip>
        </Section>

        {/* Glossary */}
        <Section emoji="📖" title="Glosario rápido">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Term word="DoD">Day-over-Day — Comparación de un día vs el anterior</Term>
            <Term word="SPL">Streams Per Listener — Promedio de reproducciones por persona</Term>
            <Term word="Eng. Rate">Engagement Rate — % de gente que interactúa (likes + comments / views)</Term>
            <Term word="Creates">Videos que la gente hace usando el audio de una canción</Term>
            <Term word="Audio Views">Veces que se vieron videos que usan el audio del artista</Term>
            <Term word="Footprint">Huella digital — la presencia total en redes sociales</Term>
            <Term word="Sentiment">Análisis automático de si lo que dicen es positivo, negativo o neutral</Term>
            <Term word="Mentions">Cada vez que alguien nombra a Santos Bravos en internet</Term>
            <Term word="Unique Authors">Personas diferentes (no cuentas repetidas) que hablaron del tema</Term>
            <Term word="Cobrand">Plataforma que mide cuánto se usa un audio en TikTok e Instagram</Term>
          </div>
        </Section>

        {/* FAQ */}
        <Section emoji="❓" title="Preguntas frecuentes">
          <div className="space-y-4">
            <div>
              <p className="text-white font-bold">¿Cada cuánto se actualizan los datos?</p>
              <p className="text-neutral-400">El reporte se genera diariamente. Los datos de APIs (Chartmetric, YouTube, Meltwater) se pueden actualizar automáticamente. Los de browser (Spotify for Artists, Cobrand, Instagram) requieren scraping.</p>
            </div>
            <div>
              <p className="text-white font-bold">¿Puedo ver datos de días anteriores?</p>
              <p className="text-neutral-400">Próximamente — estamos implementando un selector de fechas con base de datos (Supabase) para que puedas navegar el historial completo.</p>
            </div>
            <div>
              <p className="text-white font-bold">¿Qué significan los colores verde y rojo en los números?</p>
              <p className="text-neutral-400">Verde = creció respecto al reporte anterior. Rojo = bajó. Así de simple.</p>
            </div>
            <div>
              <p className="text-white font-bold">¿Puedo compartir el dashboard?</p>
              <p className="text-neutral-400">Sí, solo comparte el link. Cualquiera con el link puede verlo. No necesita cuenta ni contraseña.</p>
            </div>
            <div>
              <p className="text-white font-bold">¿Por qué algunos videos dicen 0 en Audio Views o Creates?</p>
              <p className="text-neutral-400">Si un track es muy nuevo (como KAWASAKI), puede que aún no tenga datos de audio en TikTok/IG. Los datos aparecen conforme la gente empieza a usar el audio.</p>
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
