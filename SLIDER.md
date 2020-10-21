# Slider Feature

- needs to support horizontal (default) or vertical sliders
- needs to support 1 thumb
  - the "active" state needs to be inverse-able. Defaults to left (or bottom)
- needs to support 2 thumbs
  - the "active" state needs to be inverse-able. Defaults to inner, but can be
    outer
- needs to also pass the event handlers to the main "track" so that the
  "closest" thumb can be determined by click and touch events (this)
  - needs to pass the event handlers to each thumb so that the drag index can be
    determined (maybe)
- needs to support the "balloon values"
  - named discrete sliders
- needs to support custom ranges
- needs to support ticks at random intervals (steps)
- needs to support number precision
- needs to not close dialogs while dragging with mouse if mouse moves to overlay
- needs to support rendering icons
- needs to support rendering a text field to change the value

## Slider Folders

- `slider` - the first pass with a slider as a separate package
- `slider2` - the second pass putting the slider in the form package and
  implemented single thumb slider
- `slider3` - WIP trying to support 2 thumbs
- `slider4` - WIP trying to support 2 thumbs again, giving up, and writing this
  README

## Other Notes

- general styling is mostly done. might need to redo the tracks once two thumbs
  are implemented
- might want to make a convenience hook for single thumb sliders since
  `useSlider` will always return a list of two values.
- might have to update the `step` to be a list of number to implement the custom
  "tick" behavior. the slider will have to jump to the closest step... yay
- the `handleMouseDown` that exists in `Slider` right now should be updated to
  find the "closest" thumb to the mouse and focus that instead.
- I'm not sure if using `ref`s for the thumbs are worthwhile
- need to figure out how I want to handle "overlapping" with the 2 thumb/range
  approach. MUI makes it look like the drag target swaps, but I think I prefer
  preventing dragging past the second thumb instead
- maybe set the drag mode/dragging state for immediate updates while the
  `UserInteractionMode` is for `"keyboard"`
  - should hopefully be able to eliminate that super weird `Date.now()` stuff in
    the keyboard handler
- the SliderTrack definitely won't work with two thumbs since I was using a
  `::before` and `::after` "hack" to prevent additional elements being
  displayed. Well.. it works for everything except `inversed` behavior with the
  two thumb slider. Maybe could "hack" it still and inverse the base track
  colors instead of creating two different ranges?

Planning on making the `Slider` component be something like:

```tsx
const [thumb1Value, thumb2Value] = values;

return (
  <SliderTrack {...props}>
    <SliderThumb {...thumb1Props} value={thumb1Value} />
    {range && <SliderThumb {...thumb2Props} value={thumb2Value} />}
  </SliderTrack>
);
```
