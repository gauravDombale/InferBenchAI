export const MODEL_COLORS = {
  mistral: "#3b82f6",
  llama3: "#a855f7",
  phi: "#22c55e",
};

export const getColor = (model) => MODEL_COLORS[model] || "#3b82f6";

export const darkTooltip = {
  contentStyle: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
  },
  itemStyle: { color: "#fff" },
  labelStyle: { color: "#999" },
};
