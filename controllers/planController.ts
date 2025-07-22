import { Request, Response } from 'express';
import Plan from '../models/Plan';

const PlanController = {
  // Crear un plan
  async createPlan(req: Request, res: Response) {
    try {
      const plan = await Plan.create(req.body);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Listar todos los planes
  async getAllPlans(req: Request, res: Response) {
    try {
      const plans = await Plan.find().sort({ name: 1 });
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un plan por ID
  async getPlanById(req: Request, res: Response) {
    try {
      const plan = await Plan.findById(req.params.id);
      if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar un plan
  async updatePlan(req: Request, res: Response) {
    try {
      const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar un plan
  async deletePlan(req: Request, res: Response) {
    try {
      const plan = await Plan.findByIdAndDelete(req.params.id);
      if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
      res.json({ message: 'Plan eliminado' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default PlanController;
