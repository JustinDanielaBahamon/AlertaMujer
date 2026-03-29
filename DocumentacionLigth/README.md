El export defaulto es como un psvm en java , lo del main

-Los dos le dicen al sistema "por aquí empieza esto". La diferencia es que en Java hay un solo main para toda la app, en React Native cada archivo tiene su propio export default porque cada archivo es una pantalla independiente.

- Para ver el estado del aplicativo y hacer un tipo de debugin o compilacion debemos de estar pendiente de la terminal en la que hicimos npm start , es decir si se hacen cambios deben de aparecer algunos avisos en esa terminal

-Cuando se trabaja en React Native se suele trabajar con componentes es decir hagan de cuenta 2que es hacer una aplicacion bloque por bloque como si fuer aun lego se arma una figura con cada bloque aqui es igual cada bloque tiene una responsabilidad unica y demas a ello tendremos claro que hace cada uno. 

- cuando trabaja con componentes siempre se deben de nombrar con Mayusculas , si no se hace asi react native no lo tomara como componente si no como etiqueta

-- 28 MARZO : Trabajaremos con una libreria que se usara casi parecida a boostrap llamada React Native Paper , recomiendo que vayan a la pagina -> ( https://oss.callstack.com/react-native-paper/docs/guides/icons ) para que se informen mas de lo que tiene es muy partecida a bootstrap 

-- Ser consiente de que debemos de aplicar el SINGLE RESPONSABILITY por ello trabajaeros en cuanto se pueda con archivos NombreComponente.Style.ts ya que cada uno de ellos tendra su propio diseño , claro esta que si se hacen varios diseños que son iguales tratar de hacerlos universales para el proyecto pero OJO que no se usen diseños para un componente que se usa en todo lado ej view : color red esto seria incorrecto ya que lo apliaria a todos los views que hay en el proyecto  , es mejor ponerles un nombre y cada que se use ese estilo se pone el nombre de la clase sencillo 