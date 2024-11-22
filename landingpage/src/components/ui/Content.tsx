import React from "react";

type Props = {
  infobar?: boolean;
  headerHeight: number;
  children: React.ReactNode;
};

const Content = ({ infobar = false, headerHeight, children }: Props) => {
  return (
    <div
      style={headerHeight !== 0 ? { paddingTop: headerHeight } : {}}
      className={`flex-grow ${
        infobar
          ? "pt-headerMobileInfobar lg:pt-headerDesktopInfobar"
          : "pt-headerMobile lg:pt-headerDesktop"
      }`}
    >
      {children}
    </div>
  );
};

export default Content;
