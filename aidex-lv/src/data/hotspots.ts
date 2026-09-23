/**
 * Hotspot coordinates (percent of image width/height) for the "Your home, your
 * power station" image (media.hotspot). Update when the photograph is replaced.
 * `side` sets which side of the dot the label sits on.
 */
export const hotspots = [
  { id: 'panels', x: 40.7, y: 37.6, side: 'right' },
  { id: 'inverter', x: 62.9, y: 63.4, side: 'left' },
  { id: 'battery', x: 66.9, y: 71.5, side: 'left' },
  { id: 'ev', x: 73, y: 68.4, side: 'right' },
] as const;
export type HotspotId = (typeof hotspots)[number]['id'];
