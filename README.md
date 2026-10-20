# Mokepon

Videojuego web desarrollado con HTML, CSS y JavaScript. Un servidor Express sirve la página, sus estilos y las ilustraciones locales de los Mokepon.

## Requisitos

- Node.js y npm instalados.

## Instalación

Desde la carpeta del proyecto, instala las dependencias:

```powershell
npm install
```

## Iniciar el juego

```powershell
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador. Para detener el servidor, presiona `Ctrl+C` en la terminal donde lo iniciaste.

Si aparece el error `EADDRINUSE` para el puerto 3000, ya hay otro proceso usando ese puerto. Detén la instancia anterior o cierra su terminal antes de volver a ejecutar `npm start`.

## Controles

- Selecciona un Mokepon y pulsa **¡Confirmar Selección!**.
- En el mapa, muévete con las flechas o con `W`, `A`, `S`, `D`. También puedes usar los botones en pantalla.
- Al encontrar un rival, elige un ataque para combatir.

## Estructura

```text
mokepon/
├── assets/                 # Ilustraciones SVG de los Mokepon
├── node_modules/           # Dependencias instaladas por npm
├── public/
│   ├── index.html          # Página del juego
│   └── styles.css          # Estilos del juego
├── index.js                # Servidor Express
├── mokepon.js              # Lógica del juego
├── package.json            # Dependencias y comandos npm
├── package-lock.json       # Versiones instaladas de las dependencias
└── README.md
```

Las dependencias directas son `express` y `cors`.
