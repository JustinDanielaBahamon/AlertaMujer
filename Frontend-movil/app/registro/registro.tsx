import { router } from 'expo-router'
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform 
} from "react-native";
import { useState } from 'react';
import { styles } from '../registro/registro.styles';
import { Ionicons } from '@expo/vector-icons';

// 🔥 TIPADO DE ERRORES
type ErroresType = {
  correo?: string;
  password?: string;
  confirmPassword?: string;
};

export default function Registro(){

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState('');

  // 🔥 estados de formulario
  const [documento, setDocumento] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState('');

  // 🔥 checks
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  // 🔥 control lectura
  const [leyoTerminos, setLeyoTerminos] = useState(false);
  const [leyoPrivacidad, setLeyoPrivacidad] = useState(false);
  const [errorTerminos, setErrorTerminos] = useState('');

  const [errores, setErrores] = useState<ErroresType>({});

  // 🔥 VALIDACIÓN
  const validarFormulario = () => {
    let nuevosErrores: ErroresType = {};

    if (!correo) {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!correo.includes("@")) {
      nuevosErrores.correo = "Correo inválido";
    }

    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      nuevosErrores.password = "Mínimo 6 caracteres";
    }

    if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  return(
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.ContenedorPrincipal}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >

        {/* Logo */}
        <View style={styles.ContenedorLogo}>
          <Image 
            source={require('../../assets/imagesAlertaMujer/logoAlertaMujer.png')} 
            style={styles.ImagenLogo}
          />
        </View>

        {/* Formulario */}
        <View style={styles.ContenedorFormulario}>
          
          <Text style={styles.TituloFormu}>
            Unete a nosotros Crea tu cuenta
          </Text>

          {/* Nombre */}
          <View style={styles.contenedorInput}> 
            <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScRegistro/user.png')} /> 
            <TextInput 
              style={styles.inputCorreo} 
              placeholder="Nombre completo" 
              placeholderTextColor={'#000'}
            /> 
          </View>

          {/* Teléfono */}
          <View style={styles.contenedorInput}> 
            <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScRegistro/phone.png')} /> 
            <TextInput 
              style={styles.inputCorreo} 
              placeholder="Teléfono" 
              placeholderTextColor={'#000'}
              keyboardType="phone-pad"
            /> 
          </View>

          {/* DOCUMENTO */}
          <View style={styles.contenedorInput}>
            <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScRegistro/Documento.png')}/>
            <TextInput 
              style={styles.inputCorreo}
              placeholder="Numero de Documento"
              placeholderTextColor="#000"
              value={documento}
              onChangeText={setDocumento}
            />
          </View>

          {/* Dropdown */}
          <TouchableOpacity 
            style={styles.contenedorInput}
            onPress={() => setMostrarLista(!mostrarLista)}
          >
            <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScRegistro/Documento.png')} />
            <Text style={{ flex: 1 }}>
              {tipoDocumento || 'Tipo de documento'}
            </Text>
            <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScRegistro/flechaLista.png')}/>
          </TouchableOpacity>

          {mostrarLista && (
            <View style={styles.listaDropdown}>
              <TouchableOpacity onPress={() => {setTipoDocumento('T.I'); setMostrarLista(false);}}>
                <Text style={styles.itemLista}>T.I</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {setTipoDocumento('C.C'); setMostrarLista(false);}}>
                <Text style={styles.itemLista}>C.C</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {setTipoDocumento('Documento extranjero'); setMostrarLista(false);}}>
                <Text style={styles.itemLista}>Documento extranjero</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FECHA */}
          <View style={styles.contenedorInput}>
            <Ionicons name="calendar-outline" size={20} color="#000" />
            <TextInput 
              style={styles.inputCorreo}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#000"
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* CORREO */}
          <View style={styles.contenedorInput}>
            <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScLogin/correo.png')}/>
            <TextInput 
              style={styles.inputCorreo}
              placeholder="Ingresa tu correo"
              placeholderTextColor="#000"
              value={correo}
              onChangeText={setCorreo}
            />
          </View>

          {errores.correo && <Text style={{color:'red', marginLeft:10}}>{errores.correo}</Text>}

          {/* PASSWORD */}
          <View style={styles.contenedorInput}>
            <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScRegistro/llave.png')}/>
            <TextInput 
              style={styles.inputContraseña}
              secureTextEntry={!mostrarPassword}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
              <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScLogin/ojoPriv.png')}/>
            </TouchableOpacity>
          </View>

          {errores.password && <Text style={{color:'red', marginLeft:10}}>{errores.password}</Text>}

          {/* CONFIRM PASSWORD */}
          <View style={styles.contenedorInput}>
            <TextInput 
              style={styles.inputContraseña}
              secureTextEntry={!mostrarConfirmPassword}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}>
              <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScLogin/ojoPriv.png')}/>
            </TouchableOpacity>
          </View>

          {errores.confirmPassword && <Text style={{color:'red', marginLeft:10}}>{errores.confirmPassword}</Text>}

        </View>

        {/* CHECKS */}
        <View style={styles.contenedorChecks}>

          {/* Términos */}
          <View style={styles.filaCheck}>
            <TouchableOpacity 
              style={[styles.cuadroCheck, aceptaTerminos && { backgroundColor: '#6A3FC9' }]}
              onPress={() => {
                if (!leyoTerminos) {
                  setErrorTerminos("Debes leer los términos primero");
                  return;
                }
                setErrorTerminos('');
                setAceptaTerminos(!aceptaTerminos);
              }}
            />

            <Text style={styles.textoCheck}>
              Acepto los{" "}
              <Text 
                style={styles.textoLink}
                onPress={() => {
                  setErrorTerminos('');
                  setLeyoTerminos(true);
                  router.push('../politica/terminos'); 
                }}
              >
                Términos y condiciones
              </Text>
            </Text>
          </View>

          {/* Privacidad */}
          <View style={styles.filaCheck}>
            <TouchableOpacity 
              style={[styles.cuadroCheck, aceptaPrivacidad && { backgroundColor: '#6A3FC9' }]}
              onPress={() => {
                if (!leyoPrivacidad) {
                  setErrorTerminos("Debes leer la política primero");
                  return;
                }
                setErrorTerminos('');
                setAceptaPrivacidad(!aceptaPrivacidad);
              }}
            />

            <Text style={styles.textoCheck}>
              Acepto la{" "}
              <Text 
                style={styles.textoLink}
                onPress={() => {
                  setErrorTerminos('');
                  setLeyoPrivacidad(true);
                  router.push('../politica/privacidad'); 
                }}
              >
                Política de privacidad
              </Text>
            </Text>
          </View>

          {errorTerminos !== '' && (
            <Text style={{ color: 'red', marginLeft: 10 }}>
              {errorTerminos}
            </Text>
          )}

          {/* BOTÓN */}
          <TouchableOpacity 
            style={[styles.botonContinuar , {margin : 20}]}
            onPress={() => {

              if (!aceptaTerminos || !aceptaPrivacidad) {
                setErrorTerminos("Debes aceptar términos y privacidad");
                return;
              }

              if (!validarFormulario()) return;

              console.log("Registro completo 🔥");
              
              router.push('../tutorial/bienvenido'); 
            }}
          >
            <Text style={styles.textoContinuar}>Continuar</Text>
          </TouchableOpacity>

        </View>
         
      </ScrollView>
    </KeyboardAvoidingView>
  );
}