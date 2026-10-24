import { useCallback, useEffect, useState } from "react";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

import type { MainStackParamList } from "../../../navigation/types";
import { useContactsContext } from "../../../contexts/ContactsContext";
import { toStorablePhoto } from "../../../services/photos.service";
import { useLocale } from "../../../contexts/LocaleContext";
import { isValidEmail, contactExtraTexts } from "../contactsExtra";

type AddNav = NativeStackNavigationProp<
  MainStackParamList,
  "AddContact"
>;

type AddRoute = RouteProp<
  MainStackParamList,
  "AddContact"
>;

export function useAddContactViewModel() {
  const navigation = useNavigation<AddNav>();
  const route = useRoute<AddRoute>();

  const {
    contacts,
    addContactItem,
    updateContactItem,
  } = useContactsContext();

  const { t, locale } = useLocale();

  const contactParam = route.params?.contact;
  const isEditing = Boolean(contactParam);

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmailState] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  /**
   * Emails do not allow spaces: they are removed while typing.
   */
  const setEmail = useCallback((value: string) => {
    setEmailState(value.replace(/\s/g, ""));
  }, []);

  /**
   * Load the data when editing a contact
   */
  useEffect(() => {
    if (contactParam) {
      setName(contactParam.name ?? '');
      setRelationship(contactParam.relationship ?? "");
      setPhoneNumber(contactParam.phoneNumber);
      setEmailState(contactParam.email ?? "");
      setPhotoUri(contactParam.photo ?? null);
    } else {
      setName("");
      setRelationship("");
      setPhoneNumber("");
      setEmailState("");
      setPhotoUri(null);
    }
  }, [
    contactParam?.id,
    contactParam?.name,
    contactParam?.phoneNumber,
    contactParam?.relationship,
    contactParam?.email,
    contactParam?.photo,
  ]);

  // The photo is reduced and stored as a data URI: that way it lives in the backend and is not lost
  const setPhoto = useCallback(async (uri: string) => {
    try {
      setPhotoUri(await toStorablePhoto(uri));
    } catch (error) {
      console.warn("No se pudo procesar la foto del contacto:", error);
      Alert.alert("Foto", "No se pudo usar esa foto. Intenta con otra.");
    }
  }, []);

  /**
   * Pick a photo from the gallery
   */
  const selectPhoto = useCallback(async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        t.agregar.permiso_galeria_titulo,
        t.agregar.permiso_galeria_desc
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  }, [t, setPhoto]);

  /**
   * Remove photo
   */
  const removePhoto = useCallback(() => {
    setPhotoUri(null);
  }, []);

  /**
   * Open the phone contacts
   */
  const openPhoneContacts = async () => {
    const { status } =
      await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      try {
        const selectedContact =
          await Contacts.presentContactPickerAsync();

        if (selectedContact) {
          const nameFromContacts =
            selectedContact.name ||
            `${selectedContact.firstName || ""} ${
              selectedContact.lastName || ""
            }`.trim();

          setName(nameFromContacts);

          if (
            selectedContact.phoneNumbers &&
            selectedContact.phoneNumbers.length > 0
          ) {
            setPhoneNumber(toLocalPhone(selectedContact.phoneNumbers[0].number ?? ""));
          }

          if (
            selectedContact.imageAvailable &&
            (selectedContact as any).image?.uri
          ) {
            setPhoto((selectedContact as any).image.uri);
          }
        }
      } catch (error) {
        console.error(
          "Error al seleccionar contacto:",
          error
        );
      }
    } else {
      Alert.alert(
        t.agregar.permiso_denegado_titulo,
        t.agregar.permiso_denegado_desc
      );
    }
  };

  /**
   * Save or update the contact
   */
  const save = useCallback(() => {
    const extra = contactExtraTexts[locale];

    const normalizedName = name.trim();
    const normalizedRelationship = relationship.trim();
    const normalizedPhone = phoneNumber.replace(/\D/g, "");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedPhone) {
      Alert.alert(
        t.agregar.campos_incompletos,
        t.agregar.campos_incompletos_desc
      );
      return;
    }

    if (normalizedPhone.length < 10) {
      Alert.alert(
        t.agregar.telefono_invalido,
        t.agregar.telefono_invalido_desc
      );
      return;
    }

    /**
     * Email validation (required and with a valid format)
     */
    if (!normalizedEmail) {
      Alert.alert(
        extra.correo_requerido_titulo,
        extra.correo_requerido_desc
      );
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert(
        extra.correo_invalido_titulo,
        extra.correo_invalido_desc
      );
      return;
    }

    /**
     * Duplicate contact validation
     *
     * In edit mode the current contact is excluded
     * so it can be changed without blocking its phone number.
     */
    const duplicate = contacts.find((c) => {
      const samePhone =
        c.phoneNumber.replace(/\D/g, "") ===
        normalizedPhone;

      const isSame =
        isEditing &&
        c.id === contactParam?.id;

      return samePhone && !isSame;
    });

    if (duplicate) {
      Alert.alert(
        t.agregar.duplicado_titulo,
        t.agregar.duplicado_desc
          .replace(
            "{telefono}",
            normalizedPhone.replace(
              /(\d{3})(\d{3})(\d{4})/,
              "$1 $2 $3"
            )
          )
          .replace(
            "{nombre}",
            duplicate.name ?? ""
          ),
        [
          {
            text: t.agregar.duplicado_boton,
            style: "cancel",
          },
        ]
      );

      return;
    }

    const payload = {
      name: normalizedName,
      relationship:
        normalizedRelationship || undefined,
      phoneNumber: normalizedPhone,
      email: normalizedEmail,
      photo: photoUri ?? undefined,
    };

    if (isEditing && contactParam) {
      updateContactItem(
        contactParam.id,
        payload
      );
    } else {
      addContactItem(payload);
    }

    navigation.goBack();
  }, [
    contacts,
    updateContactItem,
    addContactItem,
    contactParam,
    isEditing,
    photoUri,
    navigation,
    name,
    relationship,
    phoneNumber,
    email,
    locale,
    t,
  ]);

  /**
   * Cancel
   */
  const cancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    name: name,
    setName: setName,

    relationship: relationship,
    setRelationship: setRelationship,

    phoneNumber: phoneNumber,
    setPhoneNumber: setPhoneNumber,

    email: email,
    setEmail: setEmail,

    photoUri: photoUri,

    selectPhoto: selectPhoto,
    removePhoto: removePhoto,
    openPhoneContacts: openPhoneContacts,

    save: save,
    cancel: cancel,

    isEditing: isEditing,

    screenTitle: isEditing
      ? t.agregar.titulo_editar
      : t.agregar.titulo_agregar,

    saveButtonLabel: isEditing
      ? t.agregar.boton_guardar_edicion
      : t.agregar.boton_guardar_nuevo,
  };
}
/**
 * Colombian mobile numbers have 10 digits. Keeps only digits and drops the country code (+57) that the
 * phone book often adds, so the contact is saved as "3001234567".
 */
export function toLocalPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.length > 10 && digits.startsWith("57") ? digits.slice(2) : digits;
  return local.slice(0, 10);
}
