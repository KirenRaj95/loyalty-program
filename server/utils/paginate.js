// Parses page/limit query params into Sequelize's offset/limit, with sane defaults and caps
const getPagination = (query) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100; // prevent someone requesting an absurdly large page size

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

// Builds the response metadata shape
const buildPaginationMeta = (count, page, limit) => ({
  total: count,
  page,
  limit,
  totalPages: Math.ceil(count / limit),
});

module.exports = { getPagination, buildPaginationMeta };
