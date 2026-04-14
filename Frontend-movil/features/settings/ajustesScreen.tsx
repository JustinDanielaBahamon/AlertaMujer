import React from "react";
import AjustesComponent from "./ajustesComponent";

type Props = {
  navigation: any;
};

export default function AjustesScreen({ navigation }: Props) {
  return <AjustesComponent navigation={navigation} />;
}
