export class PaginationDto<T> {
    items: T[];
    totalItems: number;
    currentPage: number;
    totalPages: number;

    constructor(partial: Partial<PaginationDto<T>>) {
        Object.assign(this, partial);
    }
}
