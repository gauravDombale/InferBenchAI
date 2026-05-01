export function LatencyBadge({ ms }) {
  if (ms < 1000)
    return (
      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
        ⚡ Real-time
      </span>
    );
  if (ms < 3000)
    return (
      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
        ✓ Acceptable
      </span>
    );
  if (ms < 5000)
    return (
      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
        ⚠ Slow
      </span>
    );
  return (
    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
      ✗ Very Slow
    </span>
  );
}

export function costEstimate(ms) {
  return ((65 * ms) / 1000 / 3_600_000).toFixed(5);
}
