> [!IMPORTANT]
> Criptoactivos </br>
> Prog III Mod I-Sec 6y7B: </br>
> punto de evaluación: 6 pts

# Monitoreo CriptoActivo

## Ejercicio 2
### Ejercicio 2: "Plataforma de Monitoreo de Criptoactivos en Tiempo Real."
El objetivo es construir una aplicación que procese un feed de precios (simulado) y realice cálculos
estadísticos complejos en el cliente sin bloquear el hilo principal.
1. Requerimientos Funcionales:
    - Listado de Activos: Mostrar al menos 5 criptomonedas con actualización de precio cada 200ms.
    - Sistema de Alertas Dinámicas: El usuario puede definir un umbral de precio. Si se supera, la tarjeta
del activo debe cambiar de estilo visual.
2. Especificaciones Técnicas:
    - State Management con Signals: No se permite el uso de variables globales simples. Debes usar
WritableSignal para el estado base y computed para filtrar la lista y calcular promedios.
    - Web Workers para Cálculos: El cálculo del promedio móvil y la volatilidad debe delegarse a un
Web Worker para no afectar el rendimiento de la UI.
    - Directivas Estructurales Personalizadas: Crear una directiva @if personalizada (ej.
appHighlightChange) que aplique una animación flash verde/rojo al elemento HTML solo cuando el
precio suba o baje, detectando el cambio mediante el ciclo de vida de Angular.
    - Optimización de Renderizado: Uso obligatorio de trackBy (en la nueva sintaxis @for (item of items;
track item.id)) y ChangeDetectionStrategy.OnPush.
3. Arquitectura Sugerida:
      - Core Service (Data Provider): Un servicio que gestione un WebSocket o un interval de RxJS de alta
frecuencia.
      - Smart Components (Containers): Encargados de la lógica de filtrado y comunicación con el Web
Worker.
      - Presentational Components (Dumb): Reciben datos por @Input y no tienen lógica de negocio.
Entrega del ejercicio: En GitHub hagan un "Pull Request" de su rama de desarrollo a la principal.
Recuerden enviar el escrito en formato PDF del paso a paso de como hicieron su ejercicio.

Estándar para la reactividad:

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
