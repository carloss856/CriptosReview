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

## Objetivo 4 – Metricas con Web Worker
4.1 Se creo el worker de metricas con protocolo CALC/RESULT y calculos de MA/volatilidad.
4.2 Se agrego un servicio wrapper para postMessage y stream de resultados.
4.3 Se integro historial de precios, metrics signals y computed en el store.
4.4 Se mostro MA(50) y volatilidad en las tarjetas de criptoactivos.
4.5 Se endurecio el servicio del worker para degradar a fallback al fallar.
4.6 Se tiparon metrics con interfaz y view-model en el store, limpiando umbrales persistidos.

## Objetivo 5 – Flash por cambio de precio
5.1 Se creo la directiva appPriceFlash con comparacion prev/actual y limpieza de timeouts.
5.2 Se integro la directiva en el precio de la card.
5.3 Se agregaron estilos flash-up/flash-down para el indicador visual.

## Objetivo 6 – Ajuste de input de umbral
6.1 Se ajusto el input de umbral para confirmar en change/blur y evitar reseteos con precios decimales.
6.2 Se normalizo la entrada de umbral para aceptar decimales con coma y se valido el alert solo con umbrales > 0.
6.3 Se ajusto setThreshold para aceptar negativos en memoria y habilitar limpieza, sin persistir valores invalidos.
6.4 Se cambio el input de umbral a texto con normalizacion de separador decimal y validacion (> 0) para evitar reseteos por locale.
6.5 Fix: umbrales permiten negativos/0 para habilitar limpiar, alerta solo >0, step decimal por simbolo y padding simetrico.
6.6 Se corrigio el padding y layout interno de las tarjetas para evitar que porcentaje y boton Limpiar queden fuera del borde.
6.7 Se agrego un buffer local para el input de umbral y se confirmo en blur/enter para permitir escribir decimales como 0. sin que se borren.
