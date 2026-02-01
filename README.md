> [!IMPORTANT]
> Criptoactivos </br>
> Prog III Mod I-Sec 6y7B: </br>
> punto de evaluaciÃ³n: 6 pts

# Monitoreo CriptoActivo

## Ejercicio 2
### Ejercicio 2: "Plataforma de Monitoreo de Criptoactivos en Tiempo Real."
El objetivo es construir una aplicaciÃ³n que procese un feed de precios (simulado) y realice cÃ¡lculos
estadÃ­sticos complejos en el cliente sin bloquear el hilo principal.
1. Requerimientos Funcionales:
    - Listado de Activos: Mostrar al menos 5 criptomonedas con actualizaciÃ³n de precio cada 200ms.
    - Sistema de Alertas DinÃ¡micas: El usuario puede definir un umbral de precio. Si se supera, la tarjeta
del activo debe cambiar de estilo visual.
2. Especificaciones TÃ©cnicas:
    - State Management con Signals: No se permite el uso de variables globales simples. Debes usar
WritableSignal para el estado base y computed para filtrar la lista y calcular promedios.
    - Web Workers para CÃ¡lculos: El cÃ¡lculo del promedio mÃ³vil y la volatilidad debe delegarse a un
Web Worker para no afectar el rendimiento de la UI.
    - Directivas Estructurales Personalizadas: Crear una directiva @if personalizada (ej.
appHighlightChange) que aplique una animaciÃ³n flash verde/rojo al elemento HTML solo cuando el
precio suba o baje, detectando el cambio mediante el ciclo de vida de Angular.
    - OptimizaciÃ³n de Renderizado: Uso obligatorio de trackBy (en la nueva sintaxis @for (item of items;
track item.id)) y ChangeDetectionStrategy.OnPush.
3. Arquitectura Sugerida:
      - Core Service (Data Provider): Un servicio que gestione un WebSocket o un interval de RxJS de alta
frecuencia.
      - Smart Components (Containers): Encargados de la lÃ³gica de filtrado y comunicaciÃ³n con el Web
Worker.
      - Presentational Components (Dumb): Reciben datos por @Input y no tienen lÃ³gica de negocio.
Entrega del ejercicio: En GitHub hagan un "Pull Request" de su rama de desarrollo a la principal.
Recuerden enviar el escrito en formato PDF del paso a paso de como hicieron su ejercicio.

EstÃ¡ndar para la reactividad:

> [!NOTE]
> TypeScript
```
  // Uso de Signals para computar datos derivados de forma eficiente
  readonly rawPrices = signal<PriceData[]>([]);

  readonly topGainers = computed(() => {
    return this.rawPrices()
      .filter(p => p.changePercent > 5)
      .sort((a, b) => b.changePercent - a.changePercent);
  });
```
# CriptosReview

Plataforma de Monitoreo de Criptoactivos en Tiempo Real construida con Angular Signals.
El objetivo es simular un feed de precios cada 200ms y mantener la UI fluida usando
workers y componentes OnPush.

## Estado actual

- Feed simulado para al menos 5 criptomonedas.
- Umbrales por activo con persistencia en localStorage.
- Metricas MA(50) y volatilidad calculadas en Web Worker.
- Flash visual verde/rojo cuando cambia el precio.

## Como ejecutar

`ash
npm install
npm start
`
",


- 
pm start: servidor de desarrollo.
- 
pm run build: build de produccion.

## Arquitectura

- Core services: feed y worker wrapper.
- Containers (smart) con Signals y computed.
- Components (dumb) solo inputs/outputs.
- Directivas compartidas para efectos visuales.

## Notas

- Los umbrales se aplican al perder foco o al confirmar el input.
- El worker se ejecuta cada ~1s para no saturar la UI.

