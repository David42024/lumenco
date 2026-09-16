export default function Shipping() {
  const filas = [
    { zona: "Lima Metropolitana", tiempo: "2-3 días hábiles", costo: "Desde $4.90" },
    { zona: "Costa (provincias)", tiempo: "3-5 días hábiles", costo: "Desde $7.90" },
    { zona: "Sierra y selva", tiempo: "5-7 días hábiles", costo: "Desde $9.90" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-widest text-gold">Envíos</p>
      <h1 className="mt-3 font-display text-3xl text-ink dark:text-sand">Cómo enviamos tus pedidos</h1>
      <p className="mt-5 text-ink/70 dark:text-sand/70">
        Empacamos cada pieza con material de protección reforzado, pensado para objetos frágiles como cerámica y vidrio. El costo final de envío se calcula en el checkout según destino y peso del pedido.
      </p>

      <div className="mt-8 overflow-hidden rounded-sm border border-ink/10 dark:border-sand/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/50 text-ink/70 dark:bg-surfaceDark/50 dark:text-sand/70">
            <tr>
              <th className="px-4 py-3 font-medium">Zona</th>
              <th className="px-4 py-3 font-medium">Tiempo estimado</th>
              <th className="px-4 py-3 font-medium">Costo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10 dark:divide-sand/10">
            {filas.map((f) => (
              <tr key={f.zona}>
                <td className="px-4 py-3 text-ink dark:text-sand">{f.zona}</td>
                <td className="px-4 py-3 text-ink/70 dark:text-sand/70">{f.tiempo}</td>
                <td className="px-4 py-3 text-ink/70 dark:text-sand/70">{f.costo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-xl text-ink dark:text-sand">Devoluciones</h2>
      <p className="mt-3 text-ink/70 dark:text-sand/70">
        Aceptamos devoluciones dentro de los 30 días posteriores a la entrega, siempre que el producto conserve su empaque original y no muestre uso. Escríbenos desde la sección de contacto para iniciar el proceso.
      </p>
    </div>
  );
}
