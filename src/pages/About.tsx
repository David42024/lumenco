export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-widest text-gold">Nosotros</p>
      <h1 className="mt-3 font-display text-3xl text-ink dark:text-sand">
        Empezamos en un taller de 30 metros cuadrados en 2019.
      </h1>
      <div className="mt-8 space-y-5 text-ink/70 dark:text-sand/70">
        <p>
          LUMEN & CO. nació de la idea de que una casa no necesita estar llena para sentirse completa. Empezamos vendiendo piezas de cerámica hechas por nuestra fundadora en un pequeño taller, y hoy trabajamos con más de veinte talleres artesanales que comparten la misma filosofía: menos piezas, mejor hechas.
        </p>
        <p>
          Cada producto que vendemos pasa por nuestras manos antes de llegar a las tuyas. Revisamos acabados, verificamos materiales y descartamos todo lo que no cumple con el estándar que nos gustaría tener en casa.
        </p>
        <p>
          No seguimos temporadas ni tendencias de decoración. Preferimos construir un catálogo pequeño y duradero, con objetos que en diez años se van a seguir viendo bien.
        </p>
      </div>
      <img
        src="https://picsum.photos/seed/lumen-taller/1000/500"
        alt="Taller artesanal de LUMEN & CO."
        className="mt-10 aspect-[2/1] w-full rounded-sm object-cover"
      />
    </div>
  );
}
