import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Typography } from "antd";

import { UserBadgeProps } from "@/types";

const UserBadge = ({ name, style, title }: UserBadgeProps) => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const currentSeconds = dayjs().second();

    setTimeout(
      () => setInterval(() => setCurrentTime(dayjs()), 1000 * 60),
      currentSeconds * 1000
    );
  }, []);

  return (
    <div style={style}>
      <Typography.Text
        style={{ fontSize: 45, display: "block", lineHeight: 0.6 }}
      >
        Welcome {title} {name}
      </Typography.Text>
      <Typography.Text style={{ fontSize: 26 }}>
        {currentTime.format("MMMM DD, YYYY - hh:mma")}
      </Typography.Text>
    </div>
  );
};

export { UserBadge };
