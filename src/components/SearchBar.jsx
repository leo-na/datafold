export default function SearchBar({ value, onChange, onSubmit, placeholder }) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
      />
      <button
        type="submit"
        style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
      >
        Rechercher
      </button>
    </form>
  );
}
