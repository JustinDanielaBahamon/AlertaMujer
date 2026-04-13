El export defaulto es como un psvm en java , lo del main

\-Los dos le dicen al sistema "por aquí empieza esto". La diferencia es que en Java hay un solo main para toda la app, en React Native cada archivo tiene su propio export default porque cada archivo es una pantalla independiente.

* Para ver el estado del aplicativo y hacer un tipo de debugin o compilacion debemos de estar pendiente de la terminal en la que hicimos npm start , es decir si se hacen cambios deben de aparecer algunos avisos en esa terminal

\-Cuando se trabaja en React Native se suele trabajar con componentes es decir hagan de cuenta 2que es hacer una aplicacion bloque por bloque como si fuer aun lego se arma una figura con cada bloque aqui es igual cada bloque tiene una responsabilidad unica y demas a ello tendremos claro que hace cada uno.

* cuando trabaja con componentes siempre se deben de nombrar con Mayusculas , si no se hace asi react native no lo tomara como componente si no como etiqueta

\-- 28 MARZO : Trabajaremos con una libreria que se usara casi parecida a boostrap llamada React Native Paper , recomiendo que vayan a la pagina -> ( https://oss.callstack.com/react-native-paper/docs/guides/icons ) para que se informen mas de lo que tiene es muy partecida a bootstrap

\-- 30 Marzo : cual es la diferencia entre el Expo Router vs React navigation es con el react navigation nosotros somos lo que configuramos manualmente , mientras que con el expo routerr la navegation depende de las carpetas y archivos en nuestro caso estamos trabajando con el EXPO router y esto hace que sea mas ordenada desde el inicio.

\-- 31 Marzo: hay una libreria de iconos (import { MaterialIcons } from '@expo/vector-icons';) para no estar descargando imagenes de iconos.
en caso de que no esten descargada (que seria raro porque ya viene por defecto desde que se instala expo )  se instala asi --> npm install @expo/vector-icons y para verificar
para verificar que se instalo o que las tenienes es-->npm list @expo/vector-icons

\-- Ser consiente de que debemos de aplicar el SINGLE RESPONSABILITY por ello trabajaeros en cuanto se pueda con archivos NombreComponente.Style.ts ya que cada uno de ellos tendra su propio diseño , claro esta que si se hacen varios diseños que son iguales tratar de hacerlos universales para el proyecto pero OJO que no se usen diseños para un componente que se usa en todo lado ej view : color red esto seria incorrecto ya que lo apliaria a todos los views que hay en el proyecto  , es mejor ponerles un nombre y cada que se use ese estilo se pone el nombre de la clase sencillo

* 02 abril : 2 vulnerabilities (1 moderate, 1 high)

👉 Significa que:

Hay 2 paquetes con posibles problemas de seguridad
No necesariamente rompe tu app
🔧 4. Cómo solucionarlo (opcional pero recomendado)

Ejecuta:

npm audit fix -- ejecuten este comando para evitar futuros daños

\-03 abril: en el dia de hoy inicialmente se presento errores de relacionados con las rutas de archivos despues de corregir esas rutas, aparecio un nuevo error critico:
Server Error:
(0 , \_reactNativeWebDistIndex.codegenNativeComponent) is not a function

este error no esta relacionado con el codigo, sino con un conflicto de versiones entre dependecias descargadas anteriormente. en proyectos con Expo, todas las librerias deben ser compatibles con el SDK instalado porque si no lo esta se genera estos conflitos entonces como se soluciono esto:

npx expo-doctor con este comando se oermite identifcar las inconsistencias en las vesriones de los paquetes

package                         expected  found
react-native-maps               1.20.1    1.27.2
@react-navigation/bottom-tabs   ^7.4.0    ^7.15.8
@react-navigation/native        ^7.1.8    ^7.2.1
@react-navigation/native-stack  ^7.3.16   ^7.14.9

el expected--> es la version compatible con el SDK de Expo mientras q el found---> es la version instalada en el proyecto.

El problema era que se tenían versiones más nuevas de las librerías, lo cual generaba incompatibilidad con Expo

entonces para poder descargas las versiones compatibles se coloca este comando npx expo install --check y luego npx expo start -c para limpiar la cache del bundler,eliminar referencias a versiones anteriores
recompilar el proyecto correctamente.ya con eso ya sirve lo que hizo jose el modulo de mapa



* otra cosa se van a preguntar porque en tabs tengo en la carpeta contacto contanto.ts y index.tsx pues pasa que en Expo Router, cada carpeta que representa una ruta debe contener un index.tsx como punto de entrada. Otros archivos como contacto.tsx funcionan como subrutas dentro del mismo módulo.

\-- 5 de abriñ: me descague otra libreria npm install react-native-safe-area-context
esto sirve para que no quede tan pegados de área de sistema como son los gestos, barra inferior de móvil asi que por eso el Safe Area

\-- 7 de abril: con el trascurso de hoy me instalado dos librerias la primera es la npx expo install expo-sms, la otra es de npx expo install expo-contacts, npx expo install expo-camera,
npx expo install expo-av que son para lo que son permisos.

\-- 13 de abril: En el transcurso de hoy instalé la librería npx expo install expo-linear-gradient, la cual se utiliza para implementar fondos con degradado de colores dentro de la aplicación. Esta librería permite mejorar el diseño visual de las pantallas, por ejemplo aplicando transiciones de color como de rosa a blanco, haciendo la interfaz más atractiva y profesional para el usuario.



