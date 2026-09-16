// Widget de chatbot flotante. Envía { message, role, user_id } al backend
// vía sendChatMessage (ver src/lib/api.ts). El backend es responsable de
// filtrar la base de conocimiento según el rol ANTES de generar la
// respuesta con el LLM — el rol viaja como referencia, no como permiso
// autoritativo (eso siempre se valida server-side con el JWT).
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { sendChatMessage } from "@/lib/api";
import type { ChatMessage } from "@/types";

const saludoPorRol = {
  guest: "Hola, soy el asistente de LUMEN & CO. Puedo ayudarte con preguntas frecuentes sobre envíos y devoluciones. Para ver tus pedidos, inicia sesión.",
  client: "Hola, soy el asistente de LUMEN & CO. Puedo ayudarte con tus pedidos y preguntas frecuentes.",
  employee: "Asistente interno listo. Puedo consultar procedimientos, scripts de atención y protocolos de escalación.",
  admin: "Asistente interno (admin) listo. Tienes acceso completo a la base de conocimiento, incluida información confidencial.",
};

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { user, role } = useAuthStore();
  const rolActual = role();
  const [mensajes, setMensajes] = useState<ChatMessage[]>([
    { autor: "bot", texto: saludoPorRol[rolActual], fecha: new Date().toISOString() },
  ]);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || enviando) return;
    const propio: ChatMessage = { autor: "usuario", texto, fecha: new Date().toISOString() };
    setMensajes((m) => [...m, propio]);
    setInput("");
    setEnviando(true);
    try {
      const respuesta = await sendChatMessage(texto, rolActual, user?.id);
      setMensajes((m) => [...m, respuesta]);
    } catch {
      setMensajes((m) => [...m, { autor: "bot", texto: "Hubo un problema al responder. Intenta nuevamente.", fecha: new Date().toISOString() }]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window with Transitions */}
      <div
        className={`mb-4 flex h-[32rem] w-[24rem] max-w-[calc(100vw-2.5rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-ink/10 bg-cream/95 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out dark:border-sand/10 dark:bg-surfaceDark/95 ${
          abierto ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between bg-ink px-5 py-4 text-cream dark:bg-gold dark:text-charcoal">
          <div>
            <h3 className="font-display text-lg">Asistente LUMEN &amp; CO.</h3>
            <p className="text-xs opacity-70">Rol: {rolActual}</p>
          </div>
          <button
            onClick={() => setAbierto(false)}
            aria-label="Cerrar chat"
            className="rounded-full p-1.5 transition-colors hover:bg-white/20 dark:hover:bg-charcoal/20"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {mensajes.map((m, i) => (
            <div key={i} className={`flex ${m.autor === "usuario" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  m.autor === "usuario"
                    ? "rounded-br-sm bg-ink text-cream dark:bg-gold dark:text-charcoal"
                    : "rounded-bl-sm bg-white text-ink dark:bg-charcoal dark:text-sand"
                }`}
              >
                {m.texto}
              </div>
            </div>
          ))}
          {enviando && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 shadow-sm dark:bg-charcoal">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 dark:bg-sand/40" style={{ animationDelay: "0ms" }}></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 dark:bg-sand/40" style={{ animationDelay: "150ms" }}></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 dark:bg-sand/40" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={finRef} />
        </div>

        <div className="flex items-center gap-3 border-t border-ink/10 bg-white p-4 dark:border-sand/10 dark:bg-charcoal">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 rounded-full border border-ink/20 bg-cream px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold dark:border-sand/20 dark:bg-surfaceDark"
          />
          <button
            onClick={enviar}
            disabled={enviando || !input.trim()}
            aria-label="Enviar mensaje"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-cream transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:bg-gold dark:text-charcoal"
          >
            <Send size={16} className="-ml-0.5" />
          </button>
        </div>
      </div>

      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Abrir asistente"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream shadow-xl transition-transform hover:scale-105 active:scale-95 dark:bg-gold dark:text-charcoal"
      >
        {abierto ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
