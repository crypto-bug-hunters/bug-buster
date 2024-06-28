import { ReactNode } from "react";

type FormValidator<T> = (value: T) => ReactNode | null;

export const isPositiveNumber = (error?: ReactNode): FormValidator<string> => {
    return (value: string) => {
        if (value !== "" && Number(value) > 0) {
            return null;
        } else {
            return error;
        }
    };
};
