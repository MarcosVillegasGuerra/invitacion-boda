# Conectar la confirmación de asistencia

El formulario de la invitación tiene dos preguntas: **Nombre completo** (obligatoria) y **¿Cuentas con alguna restricción alimentaria o alergia?** (opcional). No comprueba si el nombre ya existe.

1. En el [Google Form actual](https://docs.google.com/forms/d/1mTkHa7I4CL7skNeiimF0OTfF3ukDSTvQ0m_NwNqw0C4/edit), deja solo estas dos preguntas: **Nombre completo** (obligatoria) y **¿Cuentas con alguna restricción alimentaria o alergia?** (opcional). Deben ser de tipo «Respuesta corta» o «Párrafo» y tener esos títulos exactos. El script no altera el formulario ni sus respuestas anteriores. Si los títulos son distintos, cambia `NAME_QUESTION` y `DIETARY_QUESTION` en `Code.gs` para que coincidan.
2. Desde el formulario, abre **Extensiones → Apps Script**. Sustituye el contenido de `Code.gs` por el de este directorio y guarda. Ejecuta `verifyFormSetup` una vez y concede acceso a tu formulario cuando Google lo solicite. No debe mostrar ningún error.
3. Pulsa **Implementar → Nueva implementación → Aplicación web**. Selecciona **Ejecutar como: yo** y **Quién tiene acceso: cualquier persona**. Copia la URL terminada en `/exec`.
4. Pega esa URL en `RSVP_WEB_APP_URL` de `js/rsvp.js`. La invitación mostrará entonces el formulario propio. Antes de configurar la URL, el botón actual de Google Forms seguirá funcionando.
5. Envía una respuesta de prueba desde la invitación publicada y comprueba que aparece en la pestaña «Respuestas» del Google Form. Si cambias el script más adelante, publica una versión nueva de la implementación.

La página envía los datos por HTTPS en un POST y espera la confirmación del script. Si el envío no se confirma, ofrece el enlace al formulario original; no muestra un éxito ficticio. La implementación web es pública para que los invitados puedan responder sin iniciar sesión, por lo que Google puede aplicar cuotas y protección contra abuso.
