import SettingsComponent from "../components/ajustesComponent";

type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  return <SettingsComponent navigation={navigation} />;
}
