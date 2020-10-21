import { HTMLAttributes, Ref, RefCallback } from "react";

export type SliderValue = readonly [number, number];

/* @internal */
export type SliderDraggingType = "mouse" | "touch" | "keyboard" | null;

/* @internal */
export type SliderThumbDragIndex = 0 | 1 | null;

export type SliderEventHandlerNames =
  | "onKeyUp"
  | "onKeyDown"
  | "onMouseDown"
  | "onTouchStart";

export type SliderEventHandlers = Pick<
  HTMLAttributes<HTMLSpanElement>,
  SliderEventHandlerNames
>;

export interface SliderRangeOptions {
  /**
   * The min value for the slider.
   */
  min?: number;

  /**
   * The max value for the slider.
   */
  max?: number;

  /**
   * Boolean if the slider is rendered vertically instead of horizontally.
   */
  vertical?: boolean;

  /**
   * Boolean if the slider is disabled and the values cannot be changed.
   */
  disabled?: boolean;
}

export interface SliderStepOptions extends SliderRangeOptions {
  /**
   * A positive number representing the value to "jump" while incrementing or
   * decrementing the slider's value. This should normally stay as the default
   * value of `1`, but can also be decimal values if needed.
   */
  step?: number;
}

export interface UseSliderOptions
  extends SliderStepOptions,
    SliderEventHandlers {
  /**
   * An optional ref to merge with the internal `ref` required for the slider to
   * work.
   */
  ref?: Ref<HTMLSpanElement>;

  /**
   * The default value to use for the slider. When omitted, this will set the
   * value to `[min, min]`
   */
  defaultValue?: SliderValue | (() => SliderValue);

  /**
   * Should the value change while the user is dragging or only once the slider
   * has been blurred? This defaults to `"onBlur"` so that it can be easy to
   * send changes to an endpoint but can be set to `"onDrag"` when you need to
   * update the UI immediately for "real-time" updates.
   */
  mode?: "onDrag" | "onBlur";

  /**
   * This is a convenience callback function that will only be called when the
   * value has changed. This _should_ normally be used when the `mode` is set to
   * `"onBlur"` so you can trigger an API call or another type of update event.
   */
  onValueChange?(value: number): void;
}

export interface SliderBehaviorProps
  extends Required<SliderRangeOptions>,
    Required<SliderEventHandlers> {
  /**
   * A ref that should be passed to the `Slider` component to handle calculating
   * the value based on the drag distance.
   */
  ref: RefCallback<HTMLSpanElement>;

  values: SliderValue;

  /**
   * The index for the thumb that is currently being dragged by the user.
   */
  dragging: SliderThumbDragIndex;
}
