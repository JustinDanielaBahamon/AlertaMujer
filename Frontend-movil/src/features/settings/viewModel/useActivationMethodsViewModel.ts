import { useNavigation } from "@react-navigation/native";
import { Alert, Linking } from "react-native";
import { requestPinWidget } from "react-native-android-widget";
import { WIDGET_NAME } from "../../widget/WidgetSOS";
import { conflictOnThisPhone } from "../../shake/manufacturerGestures";
import { useLocale } from "../../../contexts/LocaleContext";
import {
  MethodId,
  useActivationMethods,
} from "../../../contexts/ActivationMethodsContext";

export interface MethodStep {
  text: string;
}

export interface ActivationMethod {
  id: MethodId;
  icon: string;
  title: string;
  description: string;
  steps: MethodStep[];
  enabled: boolean;
  // true = for now only the preference is saved (the feature comes in a future version)
  pending: boolean;
  /** Tips so the method works well on the user's phone. */
  recommendations?: string[];
  /** Highlighted tip for the phone brand (e.g. Motorola gestures). */
  brandRecommendation?: string;
  /** Extra button inside the card (e.g. add the widget to the home screen). */
  action?: { text: string; icon: string; onPressed: () => void };
}

function buildMethod(
  m: Record<string, string>,
  id: MethodId,
  icon: string,
  prefix: string,
  totalSteps: number,
  enabled: boolean,
  pending: boolean,
): ActivationMethod {
  return {
    id,
    icon,
    title: m[`${prefix}_titulo`],
    description: m[`${prefix}_desc`],
    steps: Array.from({ length: totalSteps }, (_, i) => ({
      text: m[`${prefix}_paso${i + 1}`],
    })),
    enabled,
    pending,
  };
}

export function useActivationMethodsViewModel() {
  const navigation = useNavigation();
  const { t } = useLocale();
  const { config, change } = useActivationMethods();
  const m = t.metodosActivacion as unknown as Record<string, string>;
  const conflict = conflictOnThisPhone();

  const methods: ActivationMethod[] = [
    buildMethod(m, "boton", "radio-button-on-outline", "boton", 3, config.boton, false),
    buildMethod(m, "contacto", "person-circle-outline", "contacto", 3, config.contacto, false),
    {
      ...buildMethod(m, "agitar", "phone-portrait-outline", "agitar", 4, config.agitar, false),
      recommendations: [m.agitar_rec1, m.agitar_rec2, m.agitar_rec3, m.agitar_rec4],
      brandRecommendation: conflict === "motorola" ? m.agitar_rec_motorola : undefined,
    },
    {
      ...buildMethod(m, "widget", "apps-outline", "widget", 3, config.widget, false),
      action: { text: m.widget_agregar, icon: "add-circle-outline", onPressed: () => addWidget() },
    },
  ];

  const activeItems = methods.filter((x) => x.enabled).length;

  // System dialog to put the widget on the home screen (if the launcher allows it)
  const addWidget = () => {
    requestPinWidget({ widgetName: WIDGET_NAME })
      .then((ok) => {
        if (!ok) Alert.alert(m.widget_titulo, m.widget_manual);
      })
      .catch(() => Alert.alert(m.widget_titulo, m.widget_manual));
  };

  const setMethod = (id: MethodId, value: boolean) => {
    change(id, value);
    if (id === "widget" && value) addWidget();
    // When "shake" is turned on on a phone whose system also reacts to shaking
    if (id === "agitar" && value && conflict === "motorola") {
      Alert.alert(m.gestos_alerta_titulo, m.gestos_alerta_msg, [
        { text: m.entendido, style: "cancel" },
        {
          text: m.abrir_ajustes,
          onPress: () => Linking.sendIntent("android.settings.SETTINGS").catch(() => Linking.openSettings()),
        },
      ]);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return { methods: methods, activeItems: activeItems, total: methods.length, setMethod: setMethod, goBack: goBack };
}