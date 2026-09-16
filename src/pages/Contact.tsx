import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Contact() {
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-widest text-gold">Contacto</p>
      <h1 className="mt-3 font-display text-3xl text-ink dark:text-sand">Escríbenos</h1>
      <p className="mt-4 text-ink/70 dark:text-sand/70">
        Respondemos de lunes a sábado, de 9:00 a 18:00. También puedes usar el asistente en la esquina inferior de la pantalla para preguntas frecuentes.
      </p>

      {enviado ? (
        <p className="mt-8 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink dark:text-sand">
          Gracias por escribirnos. Te responderemos pronto a tu correo.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setEnviado(true);
          }}
          className="mt-8 space-y-5"
        >
          <Input label="Nombre" required />
          <Input label="Correo electrónico" type="email" required />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mensaje" className="text-sm font-medium text-ink/80 dark:text-sand/80">Mensaje</label>
            <textarea
              id="mensaje"
              required
              rows={5}
              className="rounded-sm border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-gold dark:border-sand/20"
            />
          </div>
          <Button type="submit">Enviar mensaje</Button>
        </form>
      )}

      <div className="mt-10 grid grid-cols-1 gap-4 border-t border-ink/10 pt-8 text-sm text-ink/60 dark:border-sand/10 dark:text-sand/60 sm:grid-cols-3">
        <p>Correo<br /><span className="text-ink dark:text-sand">hola@lumenco.com</span></p>
        <p>Teléfono<br /><span className="text-ink dark:text-sand">+51 944 123 456</span></p>
        <p>Showroom<br /><span className="text-ink dark:text-sand">Trujillo, Perú</span></p>
      </div>
    </div>
  );
}
