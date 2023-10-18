import { FC } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "./theme";

export type StyleProviderProps = {
    children?: React.ReactNode;
};

const StyleProvider: FC<StyleProviderProps> = (props) => {
    return (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            {props.children}
            <Notifications />
        </MantineProvider>
    );
};

export default StyleProvider;
