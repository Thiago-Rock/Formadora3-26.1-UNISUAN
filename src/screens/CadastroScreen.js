import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { createUser, getDataMode, updateUser } from "../services/userGateway";

export default function CadastroScreen({ route, navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const dataMode = getDataMode();

  const usuario = route.params?.usuario;

  useEffect(() => {
    if (usuario) {
      setName(usuario.name ?? "");
      setEmail(usuario.email ?? "");
    }
  }, [usuario]);

  async function salvar() {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Atenção", "Preencha nome e email.");
      return;
    }

    try {
      if (usuario) {
        await updateUser(usuario, { name, email });
        Alert.alert("Sucesso", `Usuario atualizado (${dataMode}).`);
        navigation.goBack();
        return;
      }

      await createUser({ name, email });
      Alert.alert("Sucesso", `Usuario salvo (${dataMode}).`);
      setName("");
      setEmail("");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Nao foi possivel salvar na API.");
    }
  }

  return (
    <View style={styles.container}>
      
      <Text style={styles.label}>Nome</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} />

      <Button title={usuario ? "Atualizar" : "Salvar"} onPress={salvar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 8,
  },
  label: {
    fontWeight: "600",
  },
  mode: {
    color: "#555",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
});
