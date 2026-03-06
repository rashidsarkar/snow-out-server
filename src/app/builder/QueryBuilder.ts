import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  /* -------------------- SEARCH -------------------- */
  search(searchableFields: string[]) {
    const search = this.query?.search as string;

    if (search) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: search, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  /* -------------------- FILTER -------------------- */
  filter() {
    const queryObj = { ...this.query };

    const excludeFields = ['search', 'sortBy', 'sortOrder', 'page', 'limit'];

    excludeFields.forEach((key) => delete queryObj[key]);

    if (Object.keys(queryObj).length > 0) {
      this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    }

    return this;
  }

  paginate() {
    const page = Number(this?.query.page) || 1;
    const limit = Number(this?.query.limit) || 10;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  /* -------------------- SORT -------------------- */
  sort() {
    const sortBy = this.query?.sortBy as string;
    const sortOrder = this.query?.sortOrder as string;

    if (sortBy) {
      const sortStr = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
      this.modelQuery = this.modelQuery.sort(sortStr);
    }

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-_v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
