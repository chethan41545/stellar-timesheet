import { LOCAL_STORAGE_VARIABLES } from "../constants/storageVariables";

export function getToken() {
    return localStorage.getItem(LOCAL_STORAGE_VARIABLES.ACCESS_TOKEN) || sessionStorage.getItem(LOCAL_STORAGE_VARIABLES.ACCESS_TOKEN);
}



export function readRole(): string {
    // prefer single string "role"
    const single = localStorage.getItem('role') ;
    if (single) return single;

    // fallback to array "roles"
    try {
        const role =localStorage.getItem("role");
        return role || "";
    } catch {
        return "";
    }
}

export function normalize(role: string) {
    return role.replace(/^ROLE_/i, "").toLowerCase().trim(); // e.g., "ROLE_VENDOR" -> "vendor"
}
