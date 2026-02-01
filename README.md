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
# Criptoactivos

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
