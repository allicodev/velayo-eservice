import React from "react";

import { UserBadge } from "@/app/components";
import { useUserStore } from "@/provider/context";

const Accounting = () => {
  const { currentUser } = useUserStore();

  return (
    <>
      <div className="teller main-content">
        <div
          className="body-content"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <UserBadge
            name={currentUser?.name ?? ""}
            title={
              currentUser
                ? `${currentUser.role[0].toLocaleUpperCase()}${currentUser.role.slice(
                    1
                  )}`
                : null
            }
            role="encoder"
            style={{
              margin: 25,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Accounting;
