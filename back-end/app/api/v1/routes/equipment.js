import { Router } from 'express';
import { listEquipment, getEquipmentById, createEquipment, updateEquipment, deleteEquipment } from '../../../controllers/equipment.js';

const equipmentRouter = Router();

// Equipment routes
equipmentRouter.get('/', listEquipment);
equipmentRouter.get('/:id', getEquipmentById);
equipmentRouter.post('/', createEquipment);
equipmentRouter.patch('/:id', updateEquipment);
equipmentRouter.delete('/:id', deleteEquipment);

export default equipmentRouter; 