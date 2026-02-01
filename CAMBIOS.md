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

## Objetivo 2 – UI base y componentes
2.1 Se creo el componente presentacional de tarjetas para criptoactivos con estilos base.
2.2 Se refactorizo el dashboard para usar cards y mantener OnPush con @for.
2.3 Se agrego un layout simple con header y grid responsive para el listado.
2.4 Se ajusto el formato de precio y porcentaje en las tarjetas para mantener decimales y signo.
2.5 Se corrigio la metadata de estilos en los componentes (styleUrls).

## Objetivo 3 – Alertas dinamicas por umbral
3.1 Se agrego estado de umbrales en el store con persistencia en localStorage.
3.2 Se creo el input presentacional de umbral con outputs para cambiar y limpiar.
3.3 Se conectaron eventos del card al store desde el container.
3.4 Se agrego estilo visual para resaltar tarjetas en alerta.
3.5 Se limpio la persistencia de umbrales eliminando claves vacias y valores invalidos.
3.6 Se agrego step any en el input y se aplico estilo de alerta al porcentaje.
