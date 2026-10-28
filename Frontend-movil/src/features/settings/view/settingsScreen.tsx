import SettingsComponent from "../components/settingsComponent";

type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  return <SettingsComponent navigation={navigation} />;
}
