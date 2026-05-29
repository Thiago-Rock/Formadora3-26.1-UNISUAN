const BASE_URL = "https://jsonplaceholder.typicode.com/users";

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error("Falha na comunicacao com a API.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listUsers() {
  return request(BASE_URL);
}

export async function createUser(payload) {
  return request(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id, payload) {
  return request(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id) {
  return request(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
