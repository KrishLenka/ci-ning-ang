// Shared blur-in keyframes so headings, text and buttons all arrive the same way.
// The filter is cleared to "none" afterwards: a lingering blur(0px) would cut off
// backdrop-filter (liquid glass) on anything inside the animated element.
export const blurInFrames = {
  filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
  opacity: [0, 0.5, 1],
  y: [50, -5, 0],
  transitionEnd: { filter: "none" },
};

export const blurInStart = { filter: "blur(10px)", opacity: 0, y: 50 };

/** Props for a motion element that blurs in once, after `delay` seconds. */
export const blurIn = (delay: number, stepDuration = 0.35) => ({
  initial: blurInStart,
  animate: blurInFrames,
  transition: { delay, duration: stepDuration * 2, times: [0, 0.5, 1], ease: "easeOut" as const },
});
