import { Product } from 'src/product/entities/product.entity';
import { SelectQueryBuilder } from 'typeorm';

export class QueryHelper<T> {
  constructor(
    public query: SelectQueryBuilder<T>,
    private queryString: any,
    private alias: string,
  ) {}

  sort() {
    // here we want to convert this array: ['-created_at', '+age', 'name']
    // to this object: {created_at: "DESC", age: "ASC", "name": "DESC"}
    const sortArray: string[] = this.queryString.sort?.split(',');
    if (!sortArray || !sortArray[0]?.length) {
      return this;
    }

    const result = {};

    for (const item of sortArray) {
      // Use a regular expression to match the sign and key
      const match = item.match(/^([+-]?)(.+)/);

      // Extract the sign and key from the match
      const [, sign, key] = match || [];

      // Set the sorting order based on the sign or default to "DESC"
      const order = sign === '-' ? 'DESC' : 'ASC';

      // Assign the key-value pair to the result object
      result[key] = order;
    }
    console.log({ result });
    this.query = this.query.orderBy(result);

    return this;
  }

  paginate() {
    if (this.queryString.page) {
      const page = Number(this.queryString.page) || 1;
      const limit = Number(this.queryString.limit) || 12;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip);
    }
    return this;
  }

  limit() {
    if (this.queryString.limit) {
      if (Number(this.queryString.limit) < 0) {
        // if limit is negative, skip limitation
        return this;
      }
      const limit = Number(this.queryString.limit);
      this.query = this.query.take(limit);
    } else {
      // default limit
      this.query = this.query.take(12);
    }
    return this;
  }

  fields() {
    let fields: string[];
    if (this.queryString.fields) {
      fields = this.queryString.fields.split(',');
      const fieldsWithAlias = fields.map((field) => `${this.alias}.${field}`);
      this.query = this.query.select(fieldsWithAlias);
    }

    return this;
  }

  getQuery() {
    return this.query;
  }

  filter() {
    const queryObj = { ...this.queryString };
    console.log({queryObj})

    const exclude = ['sort', 'limit', 'page', 'fields', 'q'];
    exclude.forEach((el) => delete queryObj[el]);
    // url => products?price[>=]=1000&likesQuantity[<=]=10
    // queryObj => {price: {'>=': '1000'}, likesQuantity: {'<=': '10'}}
    for (let field in queryObj) {
      if (queryObj[field] instanceof Object) {
        // queryObj[field] => {'>=': '1000'} => /products?price[>=]=1000
        for (let operator in queryObj[field]) {
          this.query = this.query.andWhere(
            `${this.alias}.${field} ${operator} ${queryObj[field][operator]}`,
          );
        }
      } else {
        // queryObj[field] => string => /products/status=active
        this.query = this.query = this.query.andWhere(
          `${this.alias}.${field} = '${queryObj[field]}'`,
        );
      }
    }
    return this;
  }

  search(field: keyof T) {
    if (this.queryString.q) {
      const queryStr = `${this.alias}.${field.toString()} LIKE :like`;
      this.query = this.query.andWhere(queryStr, {
        like: `%${this.queryString.q.split('').join('%')}%`,
      });
    }
    return this;
  }
}
