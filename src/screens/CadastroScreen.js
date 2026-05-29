import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../services/supabase";

export default function CadastroScreen({ route, navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

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

    if (usuario) {
      const { error } = await supabase
        .from("user")
        .update({ name, email })
        .eq("id", usuario.id);

      if (error) {
        Alert.alert("Erro ao atualizar", error.message);
        return;
      }

      Alert.alert("Sucesso", "Usuário atualizado!");
      navigation.goBack();
      return;
    }

    const { error } = await supabase.from("user").insert({ name, email });

    if (error) {
      Alert.alert("Erro", "Não foi possível salvar.");
      return;
    }

    Alert.alert("Sucesso", "Usuário cadastrado!");
    setName("");
    setEmail("");
    navigation.goBack();
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
  input: {
    borderWidth: 1,
    borderColor: "#999",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
});
