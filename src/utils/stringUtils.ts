

export const capitalize = (str: string) =>
    typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : str;
