import React, { forwardRef, HTMLAttributes } from "react";
import cn from "classnames";
import { bem, getPercentage } from "@react-md/utils";

import {
  DEFAULT_SLIDER_MAX,
  DEFAULT_SLIDER_MIN,
  SLIDER_OFFSET_VAR,
} from "./constants";
import { SliderStateOptions } from "./types";

const block = bem("rmd-slider-track");

type CSSProperties = React.CSSProperties & {
  [SLIDER_OFFSET_VAR]?: string;
};

export interface SliderTrackProps
  extends HTMLAttributes<HTMLSpanElement>,
    SliderStateOptions {
  /**
   * The current value of the `Slider`.
   */
  value: number;
}

export const SliderTrack = forwardRef<HTMLSpanElement, SliderTrackProps>(
  function SliderTrack(
    {
      style,
      className,
      children,
      min = DEFAULT_SLIDER_MIN,
      max = DEFAULT_SLIDER_MAX,
      value,
      dense = false,
      vertical = false,
      disabled = false,
      dragging = false,
      disableTransition,
      ...props
    },
    ref
  ) {
    const progress = getPercentage(min, max, value) * 100;
    const mergedStyle: CSSProperties = {
      ...style,
      [SLIDER_OFFSET_VAR]: `${progress}%`,
    };

    return (
      <span
        ref={ref}
        {...props}
        style={mergedStyle}
        className={cn(
          block({
            animate: !(disableTransition ?? dragging),
            dense,
            disabled,
            vertical,
            horizontal: !vertical,
            hoverable: !disabled,
          }),
          className
        )}
      >
        {children}
      </span>
    );
  }
);

if (process.env.NODE_ENV !== "production") {
  try {
    const PropTypes = require("prop-types");

    SliderTrack.propTypes = {
      style: PropTypes.object,
      className: PropTypes.string,
      children: PropTypes.node,
      dense: PropTypes.bool,
      vertical: PropTypes.bool,
      value: PropTypes.number.isRequired,
      min: PropTypes.number,
      max: PropTypes.number,
      disabled: PropTypes.bool,
      dragging: PropTypes.bool,
      disableTransition: PropTypes.bool,
    };
  } catch (e) {}
}
