// features/authentication/index.ts

// ─── Vistas (las usa el navegador: AuthNavigator) ───
export { default as LoginView }    from '../authentication/views/loginScreen';
export { default as RegisterView } from '../authentication/views/registroScreen';
export { default as RecoverView }  from '../authentication/views/recuperarContraseñaScreen';

// ─── ViewModels (los usan las vistas internamente, pero se exponen por si algún componente externo los necesita) ───
export { useLoginViewModel }             from '../authentication/viewModel/useLoginViewModel';
export { useRegistroViewModel }          from '../authentication/viewModel/useRegistroViewModel';
export { useRecuperarContrasenaViewModel as useRecuperarViewModel } from '../authentication/viewModel/useRecuperarContrasenaViewModel';

// ─── Tipos/Modelos (los usan otros features, por ejemplo ContactosContext necesita saber qué es un Usuario) ───
export type { Usuario } from './models/Usuario';