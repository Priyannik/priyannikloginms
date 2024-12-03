
export function isValidUsername(username) {
    const regex = /^[a-z0-9_]{5,20}$/;
    return regex.test(username);
}
export function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}