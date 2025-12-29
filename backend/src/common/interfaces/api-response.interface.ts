export interface ApiResponseInterface<T = unknown> {
    message: string;
    data: T | null;
}
