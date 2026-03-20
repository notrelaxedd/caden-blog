"use client";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-[#0c0c0c]" />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #2a2a2a 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, #0c0c0c 100%)",
        }}
      />
    </div>
  );
}
