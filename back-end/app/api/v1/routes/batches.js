import { Router } from 'express';
import { listBatches, getBatchById, createBatch, updateBatch, deleteBatch } from '../../../controllers/batch.js';

const batchesRouter = Router();

// Batches routes
batchesRouter.get('/', listBatches);
batchesRouter.get('/:id', getBatchById);
batchesRouter.post('/', createBatch);
batchesRouter.patch('/:id', updateBatch);
batchesRouter.delete('/:id', deleteBatch);

export default batchesRouter;