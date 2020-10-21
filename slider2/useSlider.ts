import { Ref, RefCallback } from "react";
import {
  SliderStepOptions,
  SliderEventHandlers,
  SliderRangeOptions,
} from "./types";

type OneThumbSliderValue = number;
type TwoThumbSliderValue = readonly [number, number];
type SliderValue = OneThumbSliderValue | TwoThumbSliderValue;

interface UseSliderOptions extends SliderStepOptions, SliderEventHandlers {
  /**
   * An optional ref to merge with the internal `ref` required for the slider to
   * work.
   */
  ref?: Ref<HTMLSpanElement>;

  defaultValue?: SliderValue;

  mode?: "onDrag" | "onBlur";
  onValueChange?(value: number): void;
}

type ReturnedValue<DV extends SliderValue | undefined> = {
  one: OneThumbSliderValue;
  two: TwoThumbSliderValue;
}[DV extends TwoThumbSliderValue ? "two" : "one"];

interface ReturnedProps<DV extends SliderValue | undefined>
  extends Required<SliderRangeOptions>,
    Required<SliderEventHandlers> {
  /**
   * A ref that should be passed to the `Slider` component to handle calculating
   * the value based on the drag distance.
   */
  ref: RefCallback<HTMLSpanElement>;
  value: ReturnedValue<DV>;
}

type UseSliderReturnValue<DV extends SliderValue | undefined> = [
  ReturnedProps<DV>
];

export function useSlider({
  ref: propRef,
  min = DEFAULT_SLIDER_MIN,
  max = DEFAULT_SLIDER_MAX,
  step = DEFAULT_SLIDER_STEP,
  vertical = false,
  disabled = false,
  defaultValue = min,
  mode = "onDrag",
  onValueChange,
  onKeyUp,
  onKeyDown,
  onMouseDown,
  onTouchStart,
}: UseSliderOptions = {}): UseSliderReturnValue {}
