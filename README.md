# CriptosReview

CriptosReview es una aplicacion web en Angular que simula el monitoreo de criptoactivos en tiempo real.
Muestra precios actualizados, permite definir umbrales por activo, calcula metricas (MA y volatilidad)
con Web Workers y ofrece feedback visual reactivo (flash de precio y alertas).

## Funcionalidades principales

- Feed simulado cada 200 ms.
- Umbrales configurables por activo con persistencia en localStorage.
- Calculo de promedio movil y volatilidad en Web Worker.
- Efectos visuales de cambio de precio.
- Tema claro/oscuro y fondo con motivos de cripto y blockchain.
- Modo de datos reales (si hay conexion a Internet).

## Como ejecutar

```bash
npm install
npm start
```

Luego abrir `http://localhost:4200/`.

## Datos simulados vs reales

La aplicacion incluye un boton para alternar entre datos simulados y datos reales.
En modo real se consulta la API publica de CoinGecko (puede estar sujeta a limites de uso).
El servidor de desarrollo usa un proxy (`proxy.conf.json`) para evitar CORS.
Si no hay conexion, se mantiene el ultimo valor conocido.

## Estructura general

- `core/`: servicios base y Web Worker.
- `features/crypto/`: store, containers y componentes de criptoactivos.
- `shared/`: directivas reutilizables.

## Posibles mejoras

- Integrar autenticacion y perfiles.
- Agregar pruebas automatizadas.
- Enriquecer la UI con historicos y graficas.
