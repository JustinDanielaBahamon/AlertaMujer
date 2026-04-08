import {StyleSheet } from 'react-native';

export const styles = StyleSheet.create ({

ContenedorPrincipal: {
    flex: 1,
    backgroundColor: '#FBFBFF', // Un blanco con un toque azul/lavanda muy sutil
  },
  Cuerpo: {
    flex: 1,
    paddingHorizontal: 20,
  },
  TituloPagina: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginTop: 25,
    textAlign: 'left',
  },
  Subtitulo: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 20,
    lineHeight: 20,
  },
  TarjetaContacto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    // Sombras para iOS
    shadowColor: '#9e83cf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Sombras para Android
    elevation: 5,
  },
  ContenedorFoto: {
    position: 'relative',
  },
  FotoPerfil: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2,
    borderColor: '#E8DEF8',
  },
  BadgeRelacion: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#9e83cf',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'center',
  },
  TextoBadge: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  InfoContacto: {
    flex: 1,
    marginLeft: 20,
  },
  NombreContacto: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  ContenedorTelefono: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Telefono: {
    fontSize: 14,
    color: '#666',
  },
  BotonEditar: {
    backgroundColor: '#F3EFFF',
    padding: 10,
    borderRadius: 12,
  },
  BotonFlotante: {
    backgroundColor: '#9e83cf',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    right: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
});
