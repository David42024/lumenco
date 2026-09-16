// Datos de ejemplo para que la app funcione visualmente sin backend.
// Cuando VITE_USE_MOCK sea "false", src/lib/api.ts dejará de usar estos
// datos y llamará directamente a los endpoints de FastAPI documentados
// en el README.
import type { ArticuloKB, Pedido, Product, TicketSoporte, User } from "@/types";

const img = (seed: string) =>
  `https://picsum.photos/seed/${seed}/800/1000`;

export const mockProducts: Product[] = [
  {
    id: "p01",
    slug: "jarron-arena-alta",
    nombre: "Jarrón Arena Alta",
    categoria: "Jarrones",
    precioUSD: 68,
    stock: 14,
    imagen: img("lumen-jarron-01"),
    descripcionCorta: "Jarrón de cerámica artesanal en tono arena.",
    descripcionLarga:
      "Pieza torneada a mano en cerámica de alta temperatura, acabado mate en tono arena. Ideal como pieza única sobre una consola o mesa de centro. Cada unidad presenta pequeñas variaciones propias del proceso artesanal.",
    materiales: ["Cerámica", "Esmalte mate"],
    destacado: true,
  },
  {
    id: "p02",
    slug: "lampara-lino-nudo",
    nombre: "Lámpara de Mesa Lino Nudo",
    categoria: "Iluminación",
    precioUSD: 112,
    stock: 9,
    imagen: img("lumen-lampara-02"),
    descripcionCorta: "Base de roble macizo y pantalla de lino natural.",
    descripcionLarga:
      "Lámpara de mesa con base torneada en roble macizo y pantalla cosida a mano en lino crudo. Emite una luz cálida y difusa, perfecta para rincones de lectura. Incluye cable textil trenzado en tono arena.",
    materiales: ["Roble", "Lino", "Latón cepillado"],
    destacado: true,
  },
  {
    id: "p03",
    slug: "manta-lana-cruda",
    nombre: "Manta de Lana Cruda",
    categoria: "Textiles",
    precioUSD: 89,
    stock: 21,
    imagen: img("lumen-manta-03"),
    descripcionCorta: "Manta tejida en telar con lana cruda sin teñir.",
    descripcionLarga:
      "Tejida en telar manual con lana cruda de oveja, sin teñir ni blanquear, conservando su textura y aroma natural. Mide 130 x 180 cm. Perfecta para el respaldo de un sofá o el pie de la cama.",
    materiales: ["Lana 100%"],
  },
  {
    id: "p04",
    slug: "espejo-arco-nogal",
    nombre: "Espejo Arco Nogal",
    categoria: "Espejos",
    precioUSD: 145,
    stock: 6,
    imagen: img("lumen-espejo-04"),
    descripcionCorta: "Espejo de pared con marco de nogal en forma de arco.",
    descripcionLarga:
      "Marco macizo de nogal americano con acabado en aceite natural, silueta en arco suave. Sistema de anclaje incluido para pared. Dimensiones: 60 x 90 cm.",
    materiales: ["Nogal", "Vidrio biselado"],
    destacado: true,
  },
  {
    id: "p05",
    slug: "set-bandejas-marmol",
    nombre: "Set de Bandejas de Mármol",
    categoria: "Mesa",
    precioUSD: 54,
    stock: 30,
    imagen: img("lumen-bandejas-05"),
    descripcionCorta: "Dos bandejas de mármol travertino en distintos tamaños.",
    descripcionLarga:
      "Par de bandejas talladas en mármol travertino, con vetas naturales únicas en cada pieza. Ideales para organizar objetos pequeños en el baño o servir aperitivos en la mesa.",
    materiales: ["Mármol travertino"],
  },
  {
    id: "p06",
    slug: "silla-fibra-natural",
    nombre: "Silla de Fibra Natural",
    categoria: "Mobiliario",
    precioUSD: 198,
    stock: 4,
    imagen: img("lumen-silla-06"),
    descripcionCorta: "Silla de comedor con asiento tejido en fibra natural.",
    descripcionLarga:
      "Estructura de madera de haya y asiento tejido a mano en fibra natural. Un clásico atemporal que combina con mesas de madera clara u oscura por igual. Capacidad: 110 kg.",
    materiales: ["Haya", "Fibra natural"],
  },
  {
    id: "p07",
    slug: "vela-ambar-humo",
    nombre: "Vela Ámbar y Humo de Cedro",
    categoria: "Aromas",
    precioUSD: 32,
    stock: 48,
    imagen: img("lumen-vela-07"),
    descripcionCorta: "Vela de cera de soja con notas de ámbar y cedro.",
    descripcionLarga:
      "Elaborada con cera de soja 100% vegetal y mecha de algodón sin plomo. Notas de salida en ámbar cálido y fondo ahumado de cedro. Tiempo de combustión aproximado: 45 horas.",
    materiales: ["Cera de soja", "Vidrio reciclado"],
  },
  {
    id: "p08",
    slug: "cojin-boucle-crudo",
    nombre: "Cojín Bouclé Crudo",
    categoria: "Textiles",
    precioUSD: 41,
    stock: 26,
    imagen: img("lumen-cojin-08"),
    descripcionCorta: "Cojín decorativo en tejido bouclé color crudo.",
    descripcionLarga:
      "Funda en tejido bouclé texturizado color crudo con cierre invisible. Relleno de fibra hueca siliconada, hipoalergénico. Medidas: 45 x 45 cm.",
    materiales: ["Bouclé", "Algodón"],
  },
  {
    id: "p09",
    slug: "estanteria-modular-roble",
    nombre: "Estantería Modular de Roble",
    categoria: "Mobiliario",
    precioUSD: 320,
    stock: 3,
    imagen: img("lumen-estanteria-09"),
    descripcionCorta: "Sistema de estantería abierta en roble macizo.",
    descripcionLarga:
      "Módulo de estantería abierta de cinco niveles, construido en roble macizo con ensambles tradicionales. Se puede combinar con módulos adicionales para crear una librería completa.",
    materiales: ["Roble macizo"],
    destacado: true,
  },
  {
    id: "p10",
    slug: "portavelas-latón-trio",
    nombre: "Trío de Portavelas de Latón",
    categoria: "Mesa",
    precioUSD: 46,
    stock: 19,
    imagen: img("lumen-portavelas-10"),
    descripcionCorta: "Set de tres portavelas de latón macizo en distintas alturas.",
    descripcionLarga:
      "Tres portavelas de latón macizo cepillado, pensados para velas cónicas. Su altura escalonada crea un centro de mesa elegante sin esfuerzo.",
    materiales: ["Latón macizo"],
  },
  {
    id: "p11",
    slug: "alfombra-yute-trenzado",
    nombre: "Alfombra de Yute Trenzado",
    categoria: "Textiles",
    precioUSD: 134,
    stock: 8,
    imagen: img("lumen-alfombra-11"),
    descripcionCorta: "Alfombra redonda tejida a mano en yute natural.",
    descripcionLarga:
      "Tejida a mano con fibra de yute 100% natural, en un patrón trenzado circular. Aporta calidez y textura a cualquier ambiente. Diámetro: 150 cm.",
    materiales: ["Yute"],
  },
  {
    id: "p12",
    slug: "reloj-pared-minimal",
    nombre: "Reloj de Pared Minimal",
    categoria: "Decoración",
    precioUSD: 58,
    stock: 15,
    imagen: img("lumen-reloj-12"),
    descripcionCorta: "Reloj de pared con esfera de roble y manecillas finas.",
    descripcionLarga:
      "Esfera fabricada en chapa de roble natural, sin números, con manecillas finas en negro mate. Mecanismo silencioso de barrido continuo. Diámetro: 30 cm.",
    materiales: ["Roble", "Metal"],
  },
  {
    id: "p13",
    slug: "maceta-terracota-alta",
    nombre: "Maceta de Terracota Alta",
    categoria: "Jardín",
    precioUSD: 39,
    stock: 22,
    imagen: img("lumen-maceta-13"),
    descripcionCorta: "Maceta cilíndrica de terracota sin esmaltar.",
    descripcionLarga:
      "Maceta de terracota cocida sin esmaltar, con orificio de drenaje. Su superficie porosa favorece la salud de la raíz. Altura: 40 cm.",
    materiales: ["Terracota"],
  },
  {
    id: "p14",
    slug: "cuadro-lino-abstracto",
    nombre: "Cuadro Lino Abstracto",
    categoria: "Decoración",
    precioUSD: 76,
    stock: 11,
    imagen: img("lumen-cuadro-14"),
    descripcionCorta: "Pieza textil enmarcada con motivo abstracto en tonos tierra.",
    descripcionLarga:
      "Impresión sobre lino natural con motivo abstracto en tonos tierra, enmarcada en madera clara sin vidrio. Lista para colgar. Medidas: 60 x 80 cm.",
    materiales: ["Lino", "Madera de pino"],
  },
];

export const mockUsers: User[] = [
  { id: "u01", nombre: "María Fernández", email: "maria@cliente.com", rol: "client", creadoEn: "2026-03-11" },
  { id: "u02", nombre: "Jorge Salcedo", email: "jorge@cliente.com", rol: "client", creadoEn: "2026-05-02" },
  { id: "u03", nombre: "Lucía Ramos", email: "lucia@lumenco.com", rol: "employee", creadoEn: "2025-11-20" },
  { id: "u04", nombre: "Diego Herrera", email: "admin@lumenco.com", rol: "admin", creadoEn: "2025-09-01" },
];

export const mockOrders: Pedido[] = [
  {
    id: "ord-1042",
    clienteId: "u01",
    clienteNombre: "María Fernández",
    items: [
      { productoId: "p01", nombre: "Jarrón Arena Alta", cantidad: 1, precioUnitarioUSD: 68 },
      { productoId: "p07", nombre: "Vela Ámbar y Humo de Cedro", cantidad: 2, precioUnitarioUSD: 32 },
    ],
    totalUSD: 132,
    estado: "enviado",
    creadoEn: "2026-08-28",
    direccionEnvio: "Av. Los Alisos 245, Trujillo, Perú",
  },
  {
    id: "ord-1043",
    clienteId: "u02",
    clienteNombre: "Jorge Salcedo",
    items: [{ productoId: "p09", nombre: "Estantería Modular de Roble", cantidad: 1, precioUnitarioUSD: 320 }],
    totalUSD: 320,
    estado: "pendiente",
    creadoEn: "2026-09-05",
    direccionEnvio: "Jr. Bolívar 890, Trujillo, Perú",
  },
  {
    id: "ord-1044",
    clienteId: "u01",
    clienteNombre: "María Fernández",
    items: [{ productoId: "p04", nombre: "Espejo Arco Nogal", cantidad: 1, precioUnitarioUSD: 145 }],
    totalUSD: 145,
    estado: "entregado",
    creadoEn: "2026-08-02",
    direccionEnvio: "Av. Los Alisos 245, Trujillo, Perú",
  },
];

export const mockTickets: TicketSoporte[] = [
  {
    id: "tk-501",
    clienteNombre: "María Fernández",
    asunto: "Consulta por retraso en envío ord-1042",
    estado: "en_proceso",
    mensajes: [
      { autor: "María Fernández", texto: "Hola, ¿mi pedido ya salió del almacén?", fecha: "2026-09-01" },
      { autor: "Lucía Ramos", texto: "Sí, salió ayer. Te llegará en 2-3 días hábiles.", fecha: "2026-09-01" },
    ],
  },
  {
    id: "tk-502",
    clienteNombre: "Jorge Salcedo",
    asunto: "¿La estantería viene armada?",
    estado: "abierto",
    mensajes: [{ autor: "Jorge Salcedo", texto: "¿Necesito armarla yo o llega lista?", fecha: "2026-09-06" }],
  },
];

// Artículos de la base de conocimiento. `visiblePara` define el control
// de acceso: el chatbot y el módulo de KB filtran por esta lista según
// el rol del usuario autenticado (o "guest" si no hay sesión).
export const mockKBArticles: ArticuloKB[] = [
  {
    id: "kb-01",
    titulo: "Política de devoluciones (30 días)",
    categoria: "faq-publica",
    contenido:
      "Aceptamos devoluciones dentro de los 30 días posteriores a la entrega, siempre que el producto no haya sido usado y conserve su empaque original. El reembolso se procesa en un plazo de 5 días hábiles tras recibir el artículo.",
    visiblePara: ["guest", "client", "employee", "admin"],
    actualizadoEn: "2026-06-10",
  },
  {
    id: "kb-02",
    titulo: "Tiempos y zonas de envío",
    categoria: "faq-publica",
    contenido:
      "Envíos a Lima Metropolitana: 2-3 días hábiles. Provincias: 4-7 días hábiles. El costo de envío se calcula en el checkout según el peso y destino del pedido.",
    visiblePara: ["guest", "client", "employee", "admin"],
    actualizadoEn: "2026-07-02",
  },
  {
    id: "kb-03",
    titulo: "Procedimiento interno de devoluciones",
    categoria: "devoluciones",
    contenido:
      "Al recibir un producto devuelto: 1) Verificar estado en almacén con checklist QC-04. 2) Registrar el motivo en el sistema interno. 3) Si aplica reembolso, escalar a finanzas dentro de 24h. 4) Si el producto tiene defecto de fábrica, notificar a proveedores.",
    visiblePara: ["employee", "admin"],
    actualizadoEn: "2026-05-15",
  },
  {
    id: "kb-04",
    titulo: "Márgenes de ganancia por categoría (confidencial)",
    categoria: "margenes",
    contenido:
      "Iluminación: margen promedio 58%. Textiles: 62%. Mobiliario: 41%. Decoración pequeña: 65%. Esta información es confidencial y no debe compartirse con clientes ni proveedores.",
    visiblePara: ["admin"],
    actualizadoEn: "2026-04-20",
  },
  {
    id: "kb-05",
    titulo: "Directorio de proveedores — Textiles del Norte",
    categoria: "proveedores",
    contenido:
      "Proveedor: Textiles del Norte SAC. Contacto: Rosa Injante. Condiciones de pago: 30 días. Lead time de producción: 15 días hábiles. Pedido mínimo: 50 unidades por referencia.",
    visiblePara: ["admin"],
    actualizadoEn: "2026-03-30",
  },
  {
    id: "kb-06",
    titulo: "Script de atención — Reclamo por producto dañado",
    categoria: "atencion-cliente",
    contenido:
      "1) Pedir disculpas y agradecer el aviso. 2) Solicitar foto del daño y número de pedido. 3) Ofrecer reemplazo sin costo o reembolso, según preferencia del cliente. 4) Registrar el caso como incidencia de calidad.",
    visiblePara: ["employee", "admin"],
    actualizadoEn: "2026-06-25",
  },
  {
    id: "kb-07",
    titulo: "Protocolo de escalación a supervisor",
    categoria: "escalacion",
    contenido:
      "Escalar a supervisor cuando: el cliente solicite reembolso mayor a $200, exista una queja pública en redes sociales, o el caso lleve más de 48h sin resolución. Canal de escalación: canal interno #soporte-nivel-2.",
    visiblePara: ["employee", "admin"],
    actualizadoEn: "2026-06-25",
  },
  {
    id: "kb-08",
    titulo: "¿Cómo veo el estado de mi pedido?",
    categoria: "cuenta-cliente",
    contenido:
      "Puedes revisar el estado de tus pedidos desde 'Mi cuenta > Pedidos'. Los estados posibles son: pendiente, enviado y entregado. Recibirás un correo cada vez que el estado cambie.",
    visiblePara: ["client", "employee", "admin"],
    actualizadoEn: "2026-07-18",
  },
];
