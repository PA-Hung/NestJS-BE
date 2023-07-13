export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: {
        _id: string,
        name: string
    }
    permissions?: {
        name: string;
        apiPath: string;
        method: string;
        module: string;
    }[]
}