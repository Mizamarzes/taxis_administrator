import { PaginationResponseDto } from '../dto/pagination.dto';

interface PaginationData<T> {
    items: T[];
    totalItems: number;
}

/**
 * Helper para paginar datos de forma reutilizable
 * @param data - Los datos paginados { items: [], totalItems: number }
 * @param page - Página actual
 * @param limit - Límite de items por página
 * @returns PaginationResponseDto con metadata completa
 */
export const paginate = <T>(
    data: PaginationData<T>,
    page: number,
    limit: number,
): PaginationResponseDto<T> => {
    const { items, totalItems } = data;
    const pageNumber = Number.isNaN(page) || page < 1 ? 1 : Math.floor(page);
    const totalPages = Math.ceil(totalItems / limit);

    // Si la página solicitada excede el total, retorna vacío
    if (pageNumber > totalPages && totalPages > 0) {
        return new PaginationResponseDto({
            items: [],
            totalItems: 0,
            currentPage: 1,
            totalPages: 0,
            previousPage: null,
            nextPage: null,
        });
    }

    return new PaginationResponseDto({
        items,
        totalItems,
        currentPage: pageNumber,
        totalPages,
        previousPage: pageNumber > 1 ? pageNumber - 1 : null,
        nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
    });
};
