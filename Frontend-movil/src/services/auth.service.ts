import api from './api';

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  correo: string;
  telefono: string;
  rol: string;
  estado: string;
  avatarColor?: string;
  role_id?: number;
  first_name?: string;
  last_name?: string;
  password?: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  email?: string;
  password: string;
  telefono?: string;
  fechaNacimiento?: string;
  municipio?: string;
}

export const authService = {
  async login(correo: string, password: string): Promise<LoginResponse> {
    console.log('🔐 [auth.service] login INICIADO');
    console.log('🔐 [auth.service] correo:', correo);
    console.log('🔐 [auth.service] password:', password);

    // Con JSON Server puro, obtenemos todos los usuarios y filtramos localmente
    const response = await api.get<Usuario[]>('/usuarios');
    const usuarios = response.data;
    console.log('🔍 [auth.service] Total usuarios obtenidos:', usuarios.length);

    const usuario = usuarios.find(
      (u) =>
        (u.correo?.toLowerCase() === correo.toLowerCase() ||
         u.email?.toLowerCase() === correo.toLowerCase()) &&
        u.password === password
    );

    if (!usuario) {
      console.log('❌ [auth.service] Usuario no encontrado');
      throw new Error('Credenciales incorrectas');
    }

    console.log('✅ [auth.service] Usuario encontrado:', usuario);
    console.log('🔢 [auth.service] usuario.id:', usuario.id);
    console.log('🔢 [auth.service] typeof usuario.id:', typeof usuario.id);

    // No exponer el password en la respuesta
    const { password: _pwd, ...usuarioSeguro } = usuario;

    console.log('✅ [auth.service] usuarioSeguro.id:', usuarioSeguro.id);
    console.log('✅ [auth.service] typeof usuarioSeguro.id:', typeof usuarioSeguro.id);

    return {
      token: `mock-jwt-${usuarioSeguro.id}-${Date.now()}`,
      usuario: usuarioSeguro,
    };
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    // Con JSON Server puro, creamos el usuario directamente
    const nuevoUsuario = {
      nombre: data.nombre,
      correo: data.correo,
      email: data.correo,
      password: data.password,
      telefono: data.telefono || '',
      fechaNacimiento: data.fechaNacimiento || '',
      municipio: data.municipio || '',
      departamento: 'Huila',
      rol: 'Usuaria',
      estado: 'Activa',
      fechaRegistro: new Date().toLocaleDateString('es-CO'),
      ultimaActividad: 'recién registrado',
      alertas: 0,
      avatarColor: '#7c3aed',
      contactoEmergencia: 'N/A',
      role_id: 1,
      first_name: data.nombre.split(' ')[0] || data.nombre,
      last_name: data.nombre.split(' ').slice(1).join(' ') || '',
      document_number: '',
      document_type: '',
      birthdate: null,
      created_at: new Date().toISOString(),
    };

    const response = await api.post<Usuario>('/usuarios', nuevoUsuario);

    // Crear account correspondiente
    const account = {
      user_id: response.data.id,
      password_hash: data.password,
      status: 'active',
      last_access: null,
    };
    await api.post('/account', account);

    // Crear user_profile correspondiente
    const userProfile = {
      user_id: response.data.id,
      profile_photo_url: null,
      tutorial_completed: false,
      tutorial_seen_at: null,
      created_at: new Date().toISOString(),
      updated_at: null,
    };
    await api.post('/user_profile', userProfile);

    // No exponer el password en la respuesta
    const { password: _pwd, ...usuarioSeguro } = response.data;

    return {
      token: `mock-jwt-${usuarioSeguro.id}-${Date.now()}`,
      usuario: usuarioSeguro,
    };
  },
};
