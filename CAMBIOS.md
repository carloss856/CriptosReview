## Objetivo 0 – Preparacion del proyecto
0.1 Se genero el proyecto Angular en la raiz del repositorio usando SCSS y routing para establecer la base del frontend.
0.2 Se creo la estructura de carpetas basada en core / shared / features para mantener una arquitectura clara y escalable.
0.3 Se definieron los modelos iniciales de dominio para criptoactivos como contratos de datos.

## Objetivo 1 – Feed simulado y estado base
1.1 Se creo el servicio de feed que emite precios simulados cada 200ms para 5 criptoactivos.
1.2 Se implemento el store con signals (WritableSignal y computed) y suscripcion con takeUntilDestroyed.
1.3 Se agrego el container OnPush con @for para listar symbol y price desde el store.
1.4 Se conecto la ruta raiz al dashboard para visualizar el feed simulado.
1.5 Se ajusto changePercent para calcularse contra el precio base inicial por activo.
1.6 Se agrego redondeo por simbolo (BTC/ETH/SOL a 2 decimales y ADA/XRP a 4).
1.7 Se expuso el signal base como readonly y se hizo init() idempotente para evitar dobles suscripciones.
1.8 Se ajusto el formato de precio en el listado para mantener 4 decimales en ADA/XRP.
