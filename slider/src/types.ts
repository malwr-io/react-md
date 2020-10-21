import { HTMLAttributes, Ref, RefCallback } from "react";

/**
 *
 * @internal
 */
export type SliderDraggingType = "mouse" | "touch" | null;

/**
 *
 * @internal
 */
export interface SliderState {
  dragging: boolean;
  dragType: SliderDraggingType;
  value: number;
}

/**
 *
 * @internal
 */
export type SliderStepParts = Required<
  Pick<SliderStepOptions, "min" | "max" | "step">
>;

/**
 *
 * @internal
 */
export interface SliderDragValues extends SliderStepParts {
  clientX: number;
  clientY: number;
  top: number;
  height: number;
  left: number;
  width: number;
  vertical: boolean;
  reversed: boolean;
}

export interface SliderIncrementAction extends SliderStepParts {
  type: "increment";
  dragging: boolean;
}

export interface SliderDecrementAction extends SliderStepParts {
  type: "decrement";
  dragging: boolean;
}

export interface SliderMinimumAction {
  type: "minimum";
  min: number;
}

export interface SliderMaximumAction {
  type: "maximum";
  max: number;
}

export interface SliderDragAction extends SliderDragValues {
  type: "drag";
  eventType:
    | "mousedown"
    | "mousemove"
    | "mouseup"
    | "touchstart"
    | "touchmove"
    | "touchend";
}

export interface SliderStopAction {
  type: "stop";
}

export interface SliderSetValueAction {
  type: "setValue";
  value: number;
}

export type SliderAction =
  | SliderIncrementAction
  | SliderDecrementAction
  | SliderMinimumAction
  | SliderMaximumAction
  | SliderDragAction
  | SliderStopAction
  | SliderSetValueAction;

export interface SliderActionCreators {
  increment(): void;
  decrement(): void;
  minimum(): void;
  maximum(): void;
  drag(event: MouseEvent | TouchEvent): void;
  stop(): void;
  setValue(value: number): void;
}

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

export interface SliderStateOptions extends SliderRangeOptions {
  /**
   * Boolean if the dense spec has been applied.
   */
  dense?: boolean;

  /**
   * A function that is used to help with accessibility by creating a better
   * value string if just a number isn't representative enough of your range.
   */
  getValueText?(value: number): string;

  /**
   * Boolean if the slider is currently being dragged. This is mostly used to
   * disable the easing animation while being dragged.
   */
  dragging?: boolean;

  /**
   * Boolean if the transition should be disabled. This should not really be
   * touched since this is normally handled by the `useSlider` hook.
   */
  disableTransition?: boolean;
}

export type SliderEventHandlerNames =
  | "onKeyUp"
  | "onKeyDown"
  | "onMouseDown"
  | "onTouchStart";

export type SliderEventHandlers = Pick<
  HTMLAttributes<HTMLSpanElement>,
  SliderEventHandlerNames
>;

// export type MultiThumbSliderValue = readonly [number, number];

export type SliderDefaultValue = number | (() => number);

export interface UseSliderOptions
  extends SliderStepOptions,
    SliderEventHandlers {
  /**
   * An optional ref to merge with the internal `ref` required for the slider to
   * work.
   */
  ref?: Ref<HTMLSpanElement>;

  /**
   * The default value for the slider.
   */
  defaultValue?: SliderDefaultValue;
}

export interface SliderBehaviorProps
  extends Required<SliderRangeOptions>,
    Required<SliderEventHandlers>,
    Required<Pick<SliderStateOptions, "dragging">> {
  /**
   * A ref that should be passed to the `Slider` component to handle calculating
   * the value based on the drag distance.
   */
  ref: RefCallback<HTMLSpanElement>;

  /**
   * The current value of the slider.
   */
  value: number;
}

export type UseSliderReturnValue = [SliderBehaviorProps, SliderActionCreators];
