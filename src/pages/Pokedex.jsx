import { useEffect, useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import { getPokemonByName, getPokemonList } from "../api/pokemon";

const LIMIT = 20;

function formatPokemon(pokeApiData) {
  return {
    id: pokeApiData.id,
    name: pokeApiData.name,
    image: pokeApiData.sprites?.front_default || "",
    types: (pokeApiData.types || []).map((t) => t.type.name),
    stats: (pokeApiData.stats || []).map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
  };
}

export default function Pokedex() {
  // List + pagination
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [listLoading, setListLoading] = useState(true);

  // Detail
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Feedback
  const [error, setError] = useState("");

  // Favorites (persisted)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const suggestions = useMemo(() => ["pikachu", "ditto", "gengar"], []);

  async function loadList(pageIndex = page) {
    try {
      setError("");
      setListLoading(true);

      const offset = pageIndex * LIMIT;
      const data = await getPokemonList(LIMIT, offset);

      setItems(data.results || []);
      setPage(pageIndex);
    } catch {
      setError("Impossible de charger la liste.");
    } finally {
      setListLoading(false);
    }
  }

  async function loadPokemon(name) {
    const q = (name || "").trim().toLowerCase();
    if (!q) return;

    try {
      setError("");
      setDetailLoading(true);

      const data = await getPokemonByName(q);
      setSelected(formatPokemon(data));
    } catch {
      setSelected(null);
      setError("Pokémon introuvable. Essaie 'pikachu' 😉");
    } finally {
      setDetailLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    loadPokemon(search);
  }

  function handleItemClick(name) {
    setSearch(name);
    loadPokemon(name);
  }

  function toggleFavorite(name) {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function resetAll() {
    setSelected(null);
    setSearch("");
    setError("");
  }

  useEffect(() => {
    loadList(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFav = selected ? favorites.includes(selected.name) : false;

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <h1>DATAFOLD</h1>
          <p>Mini app React + API : pagination, favoris et stats (PokéAPI)</p>
        </div>
        <div className="badge">⚡ Vite • React • Axios</div>
      </div>

      <div className="grid">
        {/* LEFT: Search + List */}
        <div className="card">
          <div className="card-body">
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                if (error) setError("");
              }}
              onSubmit={handleSubmit}
              placeholder="Ex: pikachu, charizard..."
            />

            <div style={{ marginTop: 12 }}>
              {(listLoading || detailLoading) && <p className="muted">Chargement…</p>}
              {error && <p className="error">{error}</p>}
            </div>

            {!listLoading && (
              <>
                {/* Suggestions */}
                <p className="muted" style={{ marginTop: 10 }}>
                  Suggestions :{" "}
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="chip"
                      onClick={() => handleItemClick(s)}
                      style={{ cursor: "pointer" }}
                    >
                      {s}
                    </button>
                  ))}
                </p>

                {/* List */}
                <ul className="list" style={{ marginTop: 14 }}>
                  {items.map((p) => (
                    <li
                      key={p.name}
                      className="item"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleItemClick(p.name)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleItemClick(p.name);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="poke">
                        <div className="avatar">{p.name.slice(0, 2).toUpperCase()}</div>
                        <div className="poke-name">{p.name}</div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {favorites.includes(p.name) && <span title="Favori">★</span>}
                        <span className="muted">Voir →</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    className="btn"
                    disabled={page === 0}
                    onClick={() => loadList(page - 1)}
                    style={{ opacity: page === 0 ? 0.6 : 1, width: "100%" }}
                  >
                    ← Précédent
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => loadList(page + 1)}
                    style={{ width: "100%" }}
                  >
                    Suivant →
                  </button>
                </div>

                <button
                  type="button"
                  className="btn"
                  onClick={() => loadList(page)}
                  style={{ marginTop: 10, width: "100%" }}
                >
                  Recharger la page
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Detail */}
        <div className="card">
          <div className="card-body">
            <h2 style={{ marginTop: 0 }}>Détail</h2>
            <p className="muted" style={{ marginTop: -6 }}>
              Clique sur un Pokémon dans la liste ou recherche par nom.
            </p>

            {detailLoading ? (
              <div className="item" style={{ marginTop: 14 }}>
                <span className="muted">Chargement du Pokémon…</span>
              </div>
            ) : selected ? (
              <div style={{ marginTop: 14 }}>
                {/* Header */}
                <div className="big">
                  {selected.image ? (
                    <img src={selected.image} alt={selected.name} />
                  ) : (
                    <div className="avatar" style={{ width: 96, height: 96 }}>
                      {selected.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="kpi">
                    <p className="title">
                      #{selected.id} — {selected.name}
                    </p>

                    <p className="sub">Types</p>
                    <div className="types">
                      {selected.types.length ? (
                        selected.types.map((t) => (
                          <span key={t} className="chip">
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </div>

                    {/* Favorites */}
                    <button
                      type="button"
                      className="btn"
                      style={{ marginTop: 12 }}
                      onClick={() => toggleFavorite(selected.name)}
                    >
                      {isFav ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
                    </button>

                    <button
                      type="button"
                      className="btn"
                      style={{ marginTop: 10 }}
                      onClick={resetAll}
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ marginTop: 16 }}>
                  <p className="sub" style={{ marginBottom: 10 }}>
                    Stats
                  </p>

                  {selected.stats.map((s) => (
                    <div key={s.name} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <small className="muted">{s.name}</small>
                        <small className="muted">{s.value}</small>
                      </div>

                      <div
                        style={{
                          height: 8,
                          borderRadius: 999,
                          background: "rgba(15, 23, 42, 0.10)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(s.value, 100)}%`,
                            height: "100%",
                            background: "rgba(99, 102, 241, 0.90)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="item" style={{ marginTop: 14 }}>
                <span className="muted">Aucun Pokémon sélectionné.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
