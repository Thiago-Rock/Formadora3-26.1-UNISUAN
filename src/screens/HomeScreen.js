import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";

import { useEffect, useState, useCallback } from "react";

import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../services/supabase";

import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);

  function abrirEdicao(usuario) {
    navigation.navigate("Cadastro", { usuario });
  }

  async function buscarUsuarios() {
    const { data, error } = await supabase
      .from("user")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setUsuarios(data);
  }

  async function deletarUsuario(id) {
    const executarExclusao = async () => {
      const { data, error } = await supabase
        .from("user")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) {
        Alert.alert("Erro ao excluir", error.message);
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert(
          "Nada foi excluído",
          "Nenhum registro foi afetado. Verifique policy RLS de DELETE para o papel usado pelo app (anon/authenticated)."
        );
        return;
      }

      buscarUsuarios();
    };

    if (Platform.OS === "web") {
      const confirmou = globalThis.confirm
        ? globalThis.confirm("Deseja realmente excluir este usuário?")
        : true;

      if (!confirmou) {
        return;
      }

      await executarExclusao();
      return;
    }

    Alert.alert(
      "Excluir",
      "Deseja realmente excluir este usuário?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },

        {
          text: "Excluir",
          style: "destructive",
          onPress: executarExclusao,
        },
      ]
    );
  }

  useFocusEffect(
    useCallback(() => {
      buscarUsuarios();
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.nome}>{item.name}</Text>
              <Text>{item.email}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => abrirEdicao(item)}
              >
                <Ionicons name="create-outline" size={24} color="blue" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => deletarUsuario(item.id)}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum usuário cadastrado
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Cadastro")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
  },

  card: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  nome: {
    fontSize: 16,
    fontWeight: "bold",
  },

  actions: {
    flexDirection: "row",
    gap: 15,
  },

  iconButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },

  button: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});