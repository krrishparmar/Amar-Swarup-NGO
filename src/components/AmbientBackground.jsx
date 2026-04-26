import './AmbientBackground.css';

/**
 * AmbientBackground — Renders animated gradient orbs behind all content.
 * Fixed position, z-index: -1, pointer-events: none.
 * Purely decorative — no interactivity or functionality impact.
 */
export default function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-orb ambient-orb--1" />
      <div className="ambient-orb ambient-orb--2" />
      <div className="ambient-orb ambient-orb--3" />
      <div className="ambient-noise" />
    </div>
  );
}
