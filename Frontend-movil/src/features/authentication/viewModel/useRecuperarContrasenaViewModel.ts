import { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../../navigation/types";
import { Alert } from "react-native";

type Nav = NativeStackNavigationProp<AuthStackParamList, "RecuperarContrasena">;

export function useRecuperarContrasenaViewModel() {
  const navigation = useNavigation<Nav>();

  // Estados para el paso 1 (Email)
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Email, 2: Código

  // Estados para el paso 2 (Código)
  const [codigo, setCodigo] = useState(['', '', '', '']); 

  const enviarEnlace = async () => {
    if (!email.includes('@')) {
      Alert.alert("Error", "Ingresa un correo válido");
      return;
    }
    setIsLoading(true);
    // Simulación de envío
    setTimeout(() => {
      setIsLoading(false);
      setPaso(2); // Pasamos al paso del código
    }, 1500);
  };

  const handleCodigoChange = (text: string, index: number) => {
    const nuevoCodigo = [...codigo];
    nuevoCodigo[index] = text;
    setCodigo(nuevoCodigo);
  };

  const verificarCodigo = async () => {
    const codigoCompleto = codigo.join('');
    if (codigoCompleto.length < 4) {
      Alert.alert("Error", "Completa el código de 4 dígitos");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Éxito", "Código verificado correctamente");
    }, 1500);
  };

  return {
    email,
    setEmail,
    isLoading,
    paso,
    setPaso,
    codigo,
    enviarEnlace,
    handleCodigoChange,
    verificarCodigo,
    cancelar: () => navigation.goBack()
  };
}