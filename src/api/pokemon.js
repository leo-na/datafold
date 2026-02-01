import { api } from "./client";

export async function getPokemonList(limit = 30, offset = 0) {
  const res = await api.get(`/pokemon?limit=${limit}&offset=${offset}`);
  return res.data; // { results: [{name, url}], ... }
}

export async function getPokemonByName(name) {
  const res = await api.get(`/pokemon/${name.toLowerCase()}`);
  return res.data;
}
