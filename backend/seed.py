"""
Script de seed: crea las tablas (DDL) y pobla la BD con los mismos
datos del frontend (mockData.ts) para que la UI se vea idéntica
cuando se cambie a VITE_USE_MOCK=false.

Uso:
    cd backend
    python seed.py
"""
import asyncio
import ssl as _ssl
import re
from datetime import date, datetime, timezone

import asyncpg

from app.config import settings
from app.auth import hash_password

# ── DDL ──────────────────────────────────────────────────────────────

DDL = """
-- Eliminar tablas existentes (en orden inverso de dependencias)
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS ticket_mensajes CASCADE;
DROP TABLE IF EXISTS tickets_soporte CASCADE;
DROP TABLE IF EXISTS pedido_items CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Eliminar tipos si existen
DROP TYPE IF EXISTS rol_usuario CASCADE;
DROP TYPE IF EXISTS estado_pedido CASCADE;
DROP TYPE IF EXISTS estado_ticket CASCADE;

-- Tipos
CREATE TYPE rol_usuario AS ENUM ('guest', 'client', 'employee', 'admin');
CREATE TYPE estado_pedido AS ENUM ('pendiente', 'enviado', 'entregado', 'cancelado');
CREATE TYPE estado_ticket AS ENUM ('abierto', 'en_proceso', 'resuelto');

-- Tablas
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'client',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(180) UNIQUE NOT NULL,
    nombre VARCHAR(180) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    precio_usd NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    imagen_url TEXT,
    descripcion_corta TEXT,
    descripcion_larga TEXT,
    materiales TEXT[],
    destacado BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    total_usd NUMERIC(10, 2) NOT NULL,
    estado estado_pedido NOT NULL DEFAULT 'pendiente',
    direccion_envio TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pedido_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario_usd NUMERIC(10, 2) NOT NULL
);

CREATE TABLE tickets_soporte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    asunto VARCHAR(200) NOT NULL,
    estado estado_ticket NOT NULL DEFAULT 'abierto',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ticket_mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets_soporte(id) ON DELETE CASCADE,
    autor_id UUID REFERENCES usuarios(id),
    texto TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    contenido TEXT NOT NULL,
    visible_para rol_usuario[] NOT NULL DEFAULT ARRAY['admin']::rol_usuario[],
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE favoritos (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, producto_id)
);

CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_kb_categoria ON knowledge_base(categoria);
"""

# ── Contraseña genérica para todas las cuentas de prueba ─────────────
DEFAULT_PASSWORD = hash_password("password123")


async def seed():
    dsn = settings.database_url
    if "channel_binding" in dsn:
        dsn = re.sub(r"[&?]channel_binding=[^&]*", "", dsn)

    ssl_ctx = _ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = _ssl.CERT_NONE

    conn = await asyncpg.connect(dsn=dsn, ssl=ssl_ctx, statement_cache_size=0)

    try:
        # ── 1. Ejecutar DDL ──────────────────────────────────────
        print("🔧 Creando tablas...")
        await conn.execute(DDL)
        print("✅ Tablas creadas.")

        # ── 2. Usuarios ──────────────────────────────────────────
        print("👤 Insertando usuarios...")
        user_ids = {}
        users = [
            ("María Fernández", "maria@cliente.com", "client", date.fromisoformat("2026-03-11")),
            ("Jorge Salcedo", "jorge@cliente.com", "client", date.fromisoformat("2026-05-02")),
            ("Lucía Ramos", "lucia@lumenco.com", "employee", date.fromisoformat("2025-11-20")),
            ("Diego Herrera", "admin@lumenco.com", "admin", date.fromisoformat("2025-09-01")),
        ]
        for nombre, email, rol, creado in users:
            row = await conn.fetchrow(
                """
                INSERT INTO usuarios (nombre, email, password_hash, rol, creado_en)
                VALUES ($1, $2, $3, $4::rol_usuario, $5::timestamptz)
                RETURNING id
                """,
                nombre, email, DEFAULT_PASSWORD, rol, creado,
            )
            user_ids[email] = row["id"]
            print(f"   ✓ {nombre} ({rol})")

        # ── 3. Productos ─────────────────────────────────────────
        print("📦 Insertando productos...")
        product_ids = {}
        products = [
            ("p01", "jarron-arena-alta", "Jarrón Arena Alta", "Jarrones", 68, 14,
             "https://picsum.photos/seed/lumen-jarron-01/800/1000",
             "Jarrón de cerámica artesanal en tono arena.",
             "Pieza torneada a mano en cerámica de alta temperatura, acabado mate en tono arena. Ideal como pieza única sobre una consola o mesa de centro. Cada unidad presenta pequeñas variaciones propias del proceso artesanal.",
             ["Cerámica", "Esmalte mate"], True),
            ("p02", "lampara-lino-nudo", "Lámpara de Mesa Lino Nudo", "Iluminación", 112, 9,
             "https://picsum.photos/seed/lumen-lampara-02/800/1000",
             "Base de roble macizo y pantalla de lino natural.",
             "Lámpara de mesa con base torneada en roble macizo y pantalla cosida a mano en lino crudo. Emite una luz cálida y difusa, perfecta para rincones de lectura. Incluye cable textil trenzado en tono arena.",
             ["Roble", "Lino", "Latón cepillado"], True),
            ("p03", "manta-lana-cruda", "Manta de Lana Cruda", "Textiles", 89, 21,
             "https://picsum.photos/seed/lumen-manta-03/800/1000",
             "Manta tejida en telar con lana cruda sin teñir.",
             "Tejida en telar manual con lana cruda de oveja, sin teñir ni blanquear, conservando su textura y aroma natural. Mide 130 x 180 cm. Perfecta para el respaldo de un sofá o el pie de la cama.",
             ["Lana 100%"], False),
            ("p04", "espejo-arco-nogal", "Espejo Arco Nogal", "Espejos", 145, 6,
             "https://picsum.photos/seed/lumen-espejo-04/800/1000",
             "Espejo de pared con marco de nogal en forma de arco.",
             "Marco macizo de nogal americano con acabado en aceite natural, silueta en arco suave. Sistema de anclaje incluido para pared. Dimensiones: 60 x 90 cm.",
             ["Nogal", "Vidrio biselado"], True),
            ("p05", "set-bandejas-marmol", "Set de Bandejas de Mármol", "Mesa", 54, 30,
             "https://picsum.photos/seed/lumen-bandejas-05/800/1000",
             "Dos bandejas de mármol travertino en distintos tamaños.",
             "Par de bandejas talladas en mármol travertino, con vetas naturales únicas en cada pieza. Ideales para organizar objetos pequeños en el baño o servir aperitivos en la mesa.",
             ["Mármol travertino"], False),
            ("p06", "silla-fibra-natural", "Silla de Fibra Natural", "Mobiliario", 198, 4,
             "https://picsum.photos/seed/lumen-silla-06/800/1000",
             "Silla de comedor con asiento tejido en fibra natural.",
             "Estructura de madera de haya y asiento tejido a mano en fibra natural. Un clásico atemporal que combina con mesas de madera clara u oscura por igual. Capacidad: 110 kg.",
             ["Haya", "Fibra natural"], False),
            ("p07", "vela-ambar-humo", "Vela Ámbar y Humo de Cedro", "Aromas", 32, 48,
             "https://picsum.photos/seed/lumen-vela-07/800/1000",
             "Vela de cera de soja con notas de ámbar y cedro.",
             "Elaborada con cera de soja 100% vegetal y mecha de algodón sin plomo. Notas de salida en ámbar cálido y fondo ahumado de cedro. Tiempo de combustión aproximado: 45 horas.",
             ["Cera de soja", "Vidrio reciclado"], False),
            ("p08", "cojin-boucle-crudo", "Cojín Bouclé Crudo", "Textiles", 41, 26,
             "https://picsum.photos/seed/lumen-cojin-08/800/1000",
             "Cojín decorativo en tejido bouclé color crudo.",
             "Funda en tejido bouclé texturizado color crudo con cierre invisible. Relleno de fibra hueca siliconada, hipoalergénico. Medidas: 45 x 45 cm.",
             ["Bouclé", "Algodón"], False),
            ("p09", "estanteria-modular-roble", "Estantería Modular de Roble", "Mobiliario", 320, 3,
             "https://picsum.photos/seed/lumen-estanteria-09/800/1000",
             "Sistema de estantería abierta en roble macizo.",
             "Módulo de estantería abierta de cinco niveles, construido en roble macizo con ensambles tradicionales. Se puede combinar con módulos adicionales para crear una librería completa.",
             ["Roble macizo"], True),
            ("p10", "portavelas-laton-trio", "Trío de Portavelas de Latón", "Mesa", 46, 19,
             "https://picsum.photos/seed/lumen-portavelas-10/800/1000",
             "Set de tres portavelas de latón macizo en distintas alturas.",
             "Tres portavelas de latón macizo cepillado, pensados para velas cónicas. Su altura escalonada crea un centro de mesa elegante sin esfuerzo.",
             ["Latón macizo"], False),
            ("p11", "alfombra-yute-trenzado", "Alfombra de Yute Trenzado", "Textiles", 134, 8,
             "https://picsum.photos/seed/lumen-alfombra-11/800/1000",
             "Alfombra redonda tejida a mano en yute natural.",
             "Tejida a mano con fibra de yute 100% natural, en un patrón trenzado circular. Aporta calidez y textura a cualquier ambiente. Diámetro: 150 cm.",
             ["Yute"], False),
            ("p12", "reloj-pared-minimal", "Reloj de Pared Minimal", "Decoración", 58, 15,
             "https://picsum.photos/seed/lumen-reloj-12/800/1000",
             "Reloj de pared con esfera de roble y manecillas finas.",
             "Esfera fabricada en chapa de roble natural, sin números, con manecillas finas en negro mate. Mecanismo silencioso de barrido continuo. Diámetro: 30 cm.",
             ["Roble", "Metal"], False),
            ("p13", "maceta-terracota-alta", "Maceta de Terracota Alta", "Jardín", 39, 22,
             "https://picsum.photos/seed/lumen-maceta-13/800/1000",
             "Maceta cilíndrica de terracota sin esmaltar.",
             "Maceta de terracota cocida sin esmaltar, con orificio de drenaje. Su superficie porosa favorece la salud de la raíz. Altura: 40 cm.",
             ["Terracota"], False),
            ("p14", "cuadro-lino-abstracto", "Cuadro Lino Abstracto", "Decoración", 76, 11,
             "https://picsum.photos/seed/lumen-cuadro-14/800/1000",
             "Pieza textil enmarcada con motivo abstracto en tonos tierra.",
             "Impresión sobre lino natural con motivo abstracto en tonos tierra, enmarcada en madera clara sin vidrio. Lista para colgar. Medidas: 60 x 80 cm.",
             ["Lino", "Madera de pino"], False),
        ]
        for mock_id, slug, nombre, cat, precio, stock, img, desc_c, desc_l, mats, dest in products:
            row = await conn.fetchrow(
                """
                INSERT INTO productos (slug, nombre, categoria, precio_usd, stock,
                                       imagen_url, descripcion_corta, descripcion_larga,
                                       materiales, destacado)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
                """,
                slug, nombre, cat, precio, stock, img, desc_c, desc_l, mats, dest,
            )
            product_ids[mock_id] = row["id"]
        print(f"   ✓ {len(products)} productos insertados.")

        # ── 4. Pedidos ───────────────────────────────────────────
        print("🛒 Insertando pedidos...")
        # ord-1042: María — Jarrón + 2x Vela
        ord1 = await conn.fetchrow(
            """
            INSERT INTO pedidos (cliente_id, total_usd, estado, direccion_envio, creado_en)
            VALUES ($1, 132, 'enviado'::estado_pedido, 'Av. Los Alisos 245, Trujillo, Perú', '2026-08-28'::timestamptz)
            RETURNING id
            """,
            user_ids["maria@cliente.com"],
        )
        await conn.execute(
            "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario_usd) VALUES ($1,$2,1,68)",
            ord1["id"], product_ids["p01"],
        )
        await conn.execute(
            "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario_usd) VALUES ($1,$2,2,32)",
            ord1["id"], product_ids["p07"],
        )

        # ord-1043: Jorge — Estantería
        ord2 = await conn.fetchrow(
            """
            INSERT INTO pedidos (cliente_id, total_usd, estado, direccion_envio, creado_en)
            VALUES ($1, 320, 'pendiente'::estado_pedido, 'Jr. Bolívar 890, Trujillo, Perú', '2026-09-05'::timestamptz)
            RETURNING id
            """,
            user_ids["jorge@cliente.com"],
        )
        await conn.execute(
            "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario_usd) VALUES ($1,$2,1,320)",
            ord2["id"], product_ids["p09"],
        )

        # ord-1044: María — Espejo
        ord3 = await conn.fetchrow(
            """
            INSERT INTO pedidos (cliente_id, total_usd, estado, direccion_envio, creado_en)
            VALUES ($1, 145, 'entregado'::estado_pedido, 'Av. Los Alisos 245, Trujillo, Perú', '2026-08-02'::timestamptz)
            RETURNING id
            """,
            user_ids["maria@cliente.com"],
        )
        await conn.execute(
            "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario_usd) VALUES ($1,$2,1,145)",
            ord3["id"], product_ids["p04"],
        )
        print("   ✓ 3 pedidos insertados.")

        # ── 5. Tickets ───────────────────────────────────────────
        print("🎫 Insertando tickets...")
        tk1 = await conn.fetchrow(
            """
            INSERT INTO tickets_soporte (cliente_id, asunto, estado, creado_en)
            VALUES ($1, 'Consulta por retraso en envío ord-1042', 'en_proceso'::estado_ticket, '2026-09-01'::timestamptz)
            RETURNING id
            """,
            user_ids["maria@cliente.com"],
        )
        await conn.execute(
            "INSERT INTO ticket_mensajes (ticket_id, autor_id, texto, creado_en) VALUES ($1,$2,$3,'2026-09-01'::timestamptz)",
            tk1["id"], user_ids["maria@cliente.com"], "Hola, ¿mi pedido ya salió del almacén?",
        )
        await conn.execute(
            "INSERT INTO ticket_mensajes (ticket_id, autor_id, texto, creado_en) VALUES ($1,$2,$3,'2026-09-01'::timestamptz)",
            tk1["id"], user_ids["lucia@lumenco.com"], "Sí, salió ayer. Te llegará en 2-3 días hábiles.",
        )

        tk2 = await conn.fetchrow(
            """
            INSERT INTO tickets_soporte (cliente_id, asunto, estado, creado_en)
            VALUES ($1, '¿La estantería viene armada?', 'abierto'::estado_ticket, '2026-09-06'::timestamptz)
            RETURNING id
            """,
            user_ids["jorge@cliente.com"],
        )
        await conn.execute(
            "INSERT INTO ticket_mensajes (ticket_id, autor_id, texto, creado_en) VALUES ($1,$2,$3,'2026-09-06'::timestamptz)",
            tk2["id"], user_ids["jorge@cliente.com"], "¿Necesito armarla yo o llega lista?",
        )
        print("   ✓ 2 tickets insertados.")

        # ── 6. Base de conocimiento ──────────────────────────────
        print("📚 Insertando artículos KB...")
        kb_articles = [
            ("Política de devoluciones (30 días)", "faq-publica",
             "Aceptamos devoluciones dentro de los 30 días posteriores a la entrega, siempre que el producto no haya sido usado y conserve su empaque original. El reembolso se procesa en un plazo de 5 días hábiles tras recibir el artículo.",
             ["guest", "client", "employee", "admin"], "2026-06-10"),
            ("Tiempos y zonas de envío", "faq-publica",
             "Envíos a Lima Metropolitana: 2-3 días hábiles. Provincias: 4-7 días hábiles. El costo de envío se calcula en el checkout según el peso y destino del pedido.",
             ["guest", "client", "employee", "admin"], "2026-07-02"),
            ("Procedimiento interno de devoluciones", "devoluciones",
             "Al recibir un producto devuelto: 1) Verificar estado en almacén con checklist QC-04. 2) Registrar el motivo en el sistema interno. 3) Si aplica reembolso, escalar a finanzas dentro de 24h. 4) Si el producto tiene defecto de fábrica, notificar a proveedores.",
             ["employee", "admin"], "2026-05-15"),
            ("Márgenes de ganancia por categoría (confidencial)", "margenes",
             "Iluminación: margen promedio 58%. Textiles: 62%. Mobiliario: 41%. Decoración pequeña: 65%. Esta información es confidencial y no debe compartirse con clientes ni proveedores.",
             ["admin"], "2026-04-20"),
            ("Directorio de proveedores — Textiles del Norte", "proveedores",
             "Proveedor: Textiles del Norte SAC. Contacto: Rosa Injante. Condiciones de pago: 30 días. Lead time de producción: 15 días hábiles. Pedido mínimo: 50 unidades por referencia.",
             ["admin"], "2026-03-30"),
            ("Script de atención — Reclamo por producto dañado", "atencion-cliente",
             "1) Pedir disculpas y agradecer el aviso. 2) Solicitar foto del daño y número de pedido. 3) Ofrecer reemplazo sin costo o reembolso, según preferencia del cliente. 4) Registrar el caso como incidencia de calidad.",
             ["employee", "admin"], "2026-06-25"),
            ("Protocolo de escalación a supervisor", "escalacion",
             "Escalar a supervisor cuando: el cliente solicite reembolso mayor a $200, exista una queja pública en redes sociales, o el caso lleve más de 48h sin resolución. Canal de escalación: canal interno #soporte-nivel-2.",
             ["employee", "admin"], "2026-06-25"),
            ("¿Cómo veo el estado de mi pedido?", "cuenta-cliente",
             "Puedes revisar el estado de tus pedidos desde 'Mi cuenta > Pedidos'. Los estados posibles son: pendiente, enviado y entregado. Recibirás un correo cada vez que el estado cambie.",
             ["client", "employee", "admin"], "2026-07-18"),
        ]
        for titulo, cat, contenido, roles, fecha in kb_articles:
            await conn.execute(
                """
                INSERT INTO knowledge_base (titulo, categoria, contenido, visible_para, actualizado_en)
                VALUES ($1, $2, $3, $4::rol_usuario[], $5::timestamptz)
                """,
                titulo, cat, contenido, roles, date.fromisoformat(fecha),
            )
        print(f"   ✓ {len(kb_articles)} artículos KB insertados.")

        print("\n🎉 ¡Seed completado exitosamente!")
        print("   Contraseña de todas las cuentas: password123")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
