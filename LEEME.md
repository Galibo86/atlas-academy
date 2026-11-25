# Atlas Academy — v1

Juego web para aprender a escribir los números del 1 al 20 en inglés, catalán y español.

## Publicar en Netlify
1. Entra en app.netlify.com con tu cuenta.
2. Primera vez: arrastra esta carpeta a app.netlify.com/drop. Netlify te da una URL (por ejemplo, `playful-licorice-fec622.netlify.app`).
3. Versiones nuevas: abre tu sitio en Netlify › pestaña **Deploys** › arrastra la carpeta nueva a la zona de subida. La URL no cambia.

## Instalar en la tableta
1. Abre la URL en Chrome (Android).
2. Menú ⋮ › **Añadir a pantalla de inicio**.
3. Se abre a pantalla completa, en horizontal, como una app.

## Progreso
- Se guarda solo en la tableta (localStorage de Chrome) después de cada palabra. No hay cuentas.
- Si se borran los datos de Chrome, se pierde.
- Para empezar de cero: pantalla de idiomas › «Reset progress».

## Estructura del código
- `js/content.js`: contenido educativo, textos de la interfaz en los 3 idiomas y parámetros configurables (repeticiones, huesos, longitud de las lecciones).
- `js/learning.js`: lógica de aprendizaje (planes de lección, pistas, dominio, guardado).
- `js/ui.js`: pantallas e interacción (arrastre con Pointer Events).
- `css/styles.css`: estilos.
- `assets/`: ilustraciones de Atlas e iconos.
