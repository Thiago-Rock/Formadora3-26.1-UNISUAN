import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";

import { useState, useCallback } from "react";

import { Ionicons } from "@expo/vector-icons";

import { deleteUser, getDataMode, listUsers } from "../services/userGateway";

import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const dataMode = getDataMode();

  function abrirEdicao(usuario) {
    navigation.navigate("Cadastro", { usuario });
  }

  async function buscarUsuarios() {
    setLoading(true);

    try {
      const data = await listUsers();
      setUsuarios(data || []);
    } catch (error) {
      Alert.alert("Erro", "Nao foi possivel carregar os usuarios.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function executarExclusao(usuario) {
    try {
      await deleteUser(usuario);
      setUsuarios((estadoAnterior) =>
        estadoAnterior.filter((item) => item.id !== usuario.id)
      );
    } catch (error) {
      Alert.alert("Erro ao excluir", "Nao foi possivel excluir o usuario.");
      console.log(error);
      return;
    }
  }

  async function deletarUsuario(usuario) {
    if (Platform.OS === "web") {
      const confirmou = globalThis.confirm
        ? globalThis.confirm("Deseja realmente excluir este usuário?")
        : true;

      if (!confirmou) {
        return;
      }

      await executarExclusao(usuario);
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
          onPress: () => executarExclusao(usuario),
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
      

      {loading ? <ActivityIndicator size="large" color="#000" /> : null}

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
                onPress={() => deletarUsuario(item)}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Nenhum usuario encontrado</Text> : null
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

  mode: {
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
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