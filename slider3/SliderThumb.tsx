import React, { forwardRef, HTMLAttributes, ReactElement } from "react";
import cn from "classnames";
import { bem, LabelRequiredForA11y } from "@react-md/utils";

import {
  DEFAULT_SLIDER_GET_VALUE_TEXT,
  DEFAULT_SLIDER_MAX,
  DEFAULT_SLIDER_MIN,
} from "./constants";
import { SliderStateOptions } from "./types";

const block = bem("rmd-slider-thumb");

export interface BaseSliderThumbProps
  extends HTMLAttributes<HTMLSpanElement>,
    SliderStateOptions {
  /**
   * An id that's required for a11y.
   */
  id: string;

  /**
   * The current value for the slider.
   */
  value: number;
}

export type SliderThumbProps = LabelRequiredForA11y<BaseSliderThumbProps>;

/**
 * The `SliderThumb` component is an accessible version of the `role="slider"`
 * widget. This probably shouldn't be used externally, but it is exported if you
 * want to have additional control and functionality around the `Slider`
 * component.
 */
export const SliderThumb = forwardRef<HTMLSpanElement, SliderThumbProps>(
  function SliderThumb(
    {
      className,
      min = DEFAULT_SLIDER_MIN,
      max = DEFAULT_SLIDER_MAX,
      value,
      dense = false,
      vertical = false,
      dragging = false,
      disableTransition = dragging,
      disabled = false,
      tabIndex = disabled ? -1 : 0,
      getValueText = DEFAULT_SLIDER_GET_VALUE_TEXT,
      ...props
    }: SliderThumbProps,
    ref
  ): ReactElement {
    return (
      <span
        {...props}
        ref={ref}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={getValueText(value)}
        aria-disabled={disabled || undefined}
        aria-orientation={(vertical && "vertical") || undefined}
        tabIndex={tabIndex}
        className={cn(
          block({
            animate: !(disableTransition ?? dragging),
            dense,
            disabled,
            dragging,
            horizontal: !vertical,
            vertical,
            hoverable: !disabled,
          }),
          className
        )}
      />
    );
  }
);

if (process.env.NODE_ENV !== "production") {
  try {
    const PropTypes = require("prop-types");

    SliderThumb.propTypes = {
      id: PropTypes.string.isRequired,
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
    };
  } catch (e) {}
}
