/**
 * The slider value will always be a tuple of:
 * - thumb1 value
 * - thumb2 value
 *
 * If a single thumb slider is being used, the second thumb value can be
 * ignored.
 */
export type SliderValue = readonly [number, number];

export interface BaseSliderOptions {
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

export interface SliderStepOptions extends BaseSliderOptions {
  /**
   * A positive number representing the value to "jump" while incrementing or
   * decrementing the slider's value. This should normally stay as the default
   * value of `1`, but can also be decimal values if needed.
   */
  step?: number;
}

export interface UseSliderOptions extends SliderStepOptions {
  /**
   * The default value to use for the slider. When omitted, this will set the
   * value to `[min, min]`
   */
  defaultValue?: SliderValue | (() => SliderValue);
}
