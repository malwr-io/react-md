import React, {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  MouseEvent,
  useCallback,
  useRef,
} from "react";

import {
  DEFAULT_SLIDER_GET_VALUE_TEXT,
  DEFAULT_SLIDER_MAX,
  DEFAULT_SLIDER_MIN,
} from "./constants";
import { SliderThumb } from "./SliderThumb";
import { SliderTrack } from "./SliderTrack";
import {
  SliderEventHandlerNames,
  SliderEventHandlers,
  SliderStateOptions,
} from "./types";

export type SliderHTMLAttributes = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "defaultValue" | "value" | SliderEventHandlerNames
>;

export interface BaseSliderProps
  extends SliderHTMLAttributes,
    SliderStateOptions {
  /**
   * An `id` required for accessibility for the `"range"` role. This `id` will
   * be passed to the `<input type="hidden">` and to the `"range"` element as
   * `${id}-slider`.
   */
  id: string;

  /**
   * An optional name to provide to the hidden input element storing the current
   * value of the slider.
   */
  name?: string;

  /**
   * An optional style object to pass to the thumb.
   */
  thumbStyle?: CSSProperties;

  /**
   * An optional class name to pass to the thumb.
   */
  thumbClassName?: string;
}

export interface SliderProps
  extends BaseSliderProps,
    Required<SliderEventHandlers> {
  /**
   * The current value for the slider.
   */
  value: number;
}

/**
 * The `Slider` component is...
 */
export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  {
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    thumbStyle,
    thumbClassName,
    vertical = false,
    min = DEFAULT_SLIDER_MIN,
    max = DEFAULT_SLIDER_MAX,
    value,
    dense = false,
    disabled = false,
    tabIndex = disabled ? -1 : 0,
    dragging = false,
    disableTransition = dragging,
    onClick,
    getValueText = DEFAULT_SLIDER_GET_VALUE_TEXT,
    name,
    ...props
  },
  ref
) {
  const sliderRef = useRef<HTMLSpanElement | null>(null);
  const handleClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      if (onClick) {
        onClick(event);
      }

      if (!disabled) {
        sliderRef.current?.focus();
      }
    },
    [onClick, disabled]
  );

  return (
    <SliderTrack
      {...props}
      ref={ref}
      dense={dense}
      min={min}
      max={max}
      value={value}
      vertical={vertical}
      onClick={handleClick}
      disabled={disabled}
      dragging={dragging}
      disableTransition={disableTransition}
    >
      <SliderThumb
        id={`${id}-slider`}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy as string}
        ref={sliderRef}
        style={thumbStyle}
        className={thumbClassName}
        min={min}
        max={max}
        value={value}
        tabIndex={tabIndex}
        disabled={disabled}
        vertical={vertical}
        getValueText={getValueText}
        dragging={dragging}
        disableTransition={disableTransition}
      />
      <input id={id} name={name} type="hidden" value={value} />
    </SliderTrack>
  );
});

if (process.env.NODE_ENV !== "production") {
  try {
    const PropTypes = require("prop-types");

    Slider.propTypes = {
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      "aria-label": PropTypes.string,
      "aria-labelledby": PropTypes.string,
      style: PropTypes.object,
      className: PropTypes.string,
      vertical: PropTypes.bool,
      min: PropTypes.number,
      max: PropTypes.number,
      value: PropTypes.number.isRequired,
      dense: PropTypes.bool,
      disabled: PropTypes.bool,
      tabIndex: PropTypes.number,
      dragging: PropTypes.bool,
      disableTransition: PropTypes.bool,
      getValueText: PropTypes.func,
      thumbStyle: PropTypes.object,
      thumbClassName: PropTypes.string,
      onClick: PropTypes.func,
      // these are required since they are provided by the `useSlider` hook
      onKeyUp: PropTypes.func.isRequired,
      onKeyDown: PropTypes.func.isRequired,
      onMouseDown: PropTypes.func.isRequired,
      onTouchStart: PropTypes.func.isRequired,
    };
  } catch (e) {}
}
