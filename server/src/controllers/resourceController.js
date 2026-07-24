import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Builds a standard set of CRUD handlers for a model that always belongs
 * to a customer (events, services, deliverables, payments, expenses).
 * Keeping this generic avoids five near-identical controller files.
 */
export function createResourceController(Model) {
  const list = asyncHandler(async (req, res) => {
    const { customer, page = 1, limit = 50, sort = '-createdAt' } = req.query;
    const query = customer ? { customer } : {};

    const [data, total] = await Promise.all([
      Model.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(+limit)
        .populate('customer', 'customerName'),
      Model.countDocuments(query),
    ]);

    res.json({ data, total, page: +page, pages: Math.ceil(total / limit) || 1 });
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json(doc);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: 'Record not found' });
    res.json(doc);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Record not found' });
    res.status(204).end();
  });

  return { list, create, update, remove };
}
