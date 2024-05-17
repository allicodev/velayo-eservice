import React, { useState } from "react";
import { FloatLabelProps } from "@/types";

export default function FloatLabel({
  children,
  label,
  value,
  style,
  bool,
  labelClassName,
  extra,
  labelStyle,
}: FloatLabelProps) {
  const [focus, setFocus] = useState(false);

  if (!labelClassName) labelClassName = "";

  if (typeof value == "string" && value?.includes("null_money"))
    value = undefined;

  const labelClass =
    focus || (value && value.length !== 0) || bool
      ? `label label-float ${labelClassName}`
      : `label ${labelClassName}`;

  return (
    <div
      className="float-label"
      onBlur={() => setFocus(false)}
      onFocus={() => setFocus(true)}
      style={style}
    >
      {children}
      <label className={labelClass} style={{ color: "#aaa", ...labelStyle }}>
        {label}
      </label>
      {extra && <div style={{ float: "right" }}>{extra}</div>}
    </div>
  );
}
