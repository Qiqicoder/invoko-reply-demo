/**
 * Invoko brand logo — 8-pointed starburst.
 *
 * Per panel_mock_idle.png: solid terracotta (#9c4a2a) 8-pointed star. Each
 * ray is a chunky tapered "petal" wider at the inside than the tip; the
 * petals overlap at the center so no separate center dot is needed.
 *
 * Geometry: 8 rays evenly spaced at 45° increments. Each ray is a kite
 * shape — outer tip at radius ~10, max-width at radius ~5, inner tip at
 * center. Stroke `paint-order: stroke` + a tiny stroke softens the joins.
 */
export function InvokoLogo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-label="Invoko"
      role="img"
    >
      <g fill="#9c4a2a">
        {angles.map((angle) => (
          <path
            key={angle}
            // Kite ray: outer tip (12, 1.5) → right shoulder (13.5, 7)
            // → inner center (12, 12) → left shoulder (10.5, 7) → close.
            d="M12 1.5 L13.5 7 L12 12 L10.5 7 Z"
            transform={`rotate(${angle} 12 12)`}
          />
        ))}
      </g>
    </svg>
  );
}
