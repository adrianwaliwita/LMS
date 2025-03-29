import prisma from '../utils/prisma.js';

class Equipment {
    constructor({ id, name, description, quantity, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static async getEquipmentById(id) {
        const equipment = await prisma.equipment.findUnique({
            where: { id: Number(id) }
        });

        return equipment ? new Equipment(equipment) : null;
    }
    
    static async listEquipment({ name }) {
        const equipment = await prisma.equipment.findMany({
            where: name ? {
                name: { contains: name }
            } : {}
        });

        return equipment.map(item => new Equipment(item));
    }

    static async createEquipment({ name, description, quantity }) {
        const equipment = await prisma.equipment.create({
            data: {
                name,
                description,
                quantity: Number(quantity)
            }
        });

        return new Equipment(equipment);
    }

    static async updateEquipment({ id, name, description, quantity }) {
        const equipment = await prisma.equipment.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
                quantity: quantity !== undefined ? Number(quantity) : undefined
            }
        });

        return new Equipment(equipment);
    }

    static async deleteEquipment(id) {
        await prisma.equipment.delete({
            where: { id: Number(id) }
        });
    }
}

export { Equipment }; 