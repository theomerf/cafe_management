export default interface Account {
    id?: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
}

export type UserPreferences = {
    darkMode: boolean;
}