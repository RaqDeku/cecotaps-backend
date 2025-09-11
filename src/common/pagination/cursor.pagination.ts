import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { CursorPaginationDto } from './cursor.pagination.dto';

export interface PaginationMeta {
  nextCursor: Date | null;
  previousCursor: Date | null;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean | null;
}

export class CursorPaginator<Entity extends ObjectLiteral> {
  protected async applyPagination(
    queryBuilder: SelectQueryBuilder<Entity>,
    { cursor, before, limit = 10 }: CursorPaginationDto,
  ): Promise<{ data: Entity[]; meta: PaginationMeta }> {
    const isBackward = Boolean(before);
    const isFirstFetch = !cursor && !before;
    const param = isBackward ? before : cursor;
    const order = isBackward ? 'ASC' : 'DESC';
    const comparator = isBackward ? '>' : '<';

    // Base query
    queryBuilder
      .orderBy(`${queryBuilder.alias}.created_at`, order)
      .limit(limit + 1);

    if (param) {
      queryBuilder.andWhere(
        `${queryBuilder.alias}.created_at ${comparator} :param`,
        { param },
      );
    }

    // Fetch items (+1 for pagination peek)
    const items = await queryBuilder.getMany();
    let hasNextPage = items.length > limit;

    // Detect absolute start of dataset
    const earliestRecord = await queryBuilder
      .clone()
      .orderBy(`${queryBuilder.alias}.created_at`, 'ASC')
      .limit(1)
      .getOne();

    const atAbsoluteStart =
      items.length > 0 &&
      earliestRecord &&
      (items[0] as any).created_at.getTime() ===
        (earliestRecord as any).created_at.getTime();

    // Drop peek item depending on direction
    if (hasNextPage) {
      isBackward ? items.shift() : items.pop();
    }

    // Finalize data order
    const data = isBackward ? items.reverse() : items;

    // Cursors
    const nextCursor =
      data.length > 0 ? (data[data.length - 1] as any).created_at : null;

    let hasPreviousPage: boolean | null = null;
    let previousCursor: Date | null = null;

    if (isFirstFetch || (isBackward && atAbsoluteStart)) {
      hasPreviousPage = false;
    } else if (isBackward) {
      hasPreviousPage = nextCursor !== null;
    } else {
      hasPreviousPage = cursor !== null && cursor !== undefined;
    }

    if (hasPreviousPage) {
      previousCursor = data.length > 0 ? (data[0] as any).created_at : null;
    }

    return {
      data,
      meta: {
        nextCursor,
        previousCursor,
        limit,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
