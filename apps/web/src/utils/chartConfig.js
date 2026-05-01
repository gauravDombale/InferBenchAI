export const MODEL_COLORS = {
  "qwen2.5:0.5b": "#3b82f6",
  "llama3.2:1b": "#a855f7",
  "tinyllama": "#22c55e",
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
