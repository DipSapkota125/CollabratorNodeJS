import { FilterQuery, Model, SortOrder } from "mongoose";

interface PaginateOptions {
  page?: number | string;
  limit?: number | string;
  select?: string;
  sort?: Record<string, SortOrder>;
}

export const paginate = async <T>(
  model: Model<T>,
  query: FilterQuery<T>,
  options: PaginateOptions = {}
) => {
  const {
    page = 1,
    limit = 10,
    select = "",
    sort = { createdAt: -1 },
  } = options;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const totalCount = await model.countDocuments(query);
  const results = await model
    .find(query)
    .select(select)
    .skip(skip)
    .limit(limitNum)
    .sort(sort);

  return {
    results,
    pagination: {
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
  };
};
