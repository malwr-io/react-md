import React, { ReactElement, useRef, useEffect } from "react";
import {
  Slider as UncontrolledSlider,
  useSlider,
  UseSliderOptions,
  BaseSliderProps,
} from "@react-md/form";

interface NewSliderProps extends BaseSliderProps, UseSliderOptions {
  mode?: "onDrag" | "onBlur";
  onValueChange?(value: number): void;
}
function Slider({
  mode = "onChange",
  onValueChange,
  ...props
}: NewSliderProps): ReactElement {
  const [sliderProps] = useSlider({
    mode,
    onValueChange,
    ...props,
  });

  return <UncontrolledSlider aria-label="Slider" {...props} {...sliderProps} />;
}

const log = (value: number): void => {
  console.log("Value: ", value);
};

export default function SimpleSlider(): ReactElement | null {
  return (
    <>
      <Slider id="slider-1" onValueChange={log} />
      <Slider
        id="slider-2"
        mode="onBlur"
        onValueChange={log}
        min={0}
        max={1}
        step={0.25}
      />
      <Slider id="slider-3" min={-100} max={100} />
      <Slider id="slider-4" disabled />
      <Slider id="slider-5" vertical />
      <Slider id="slider-6" vertical disabled />
      <Slider id="slider-9" defaultValue={20} />
      <Slider id="slider-10" disabled defaultValue={20} />
      <Slider id="slider-11" vertical defaultValue={20} />
      <Slider id="slider-12" vertical disabled defaultValue={20} />
    </>
  );
}
