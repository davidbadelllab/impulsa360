import { Request, Response } from 'express';
import CompanyPlan from '../models/CompanyPlan';
import Plan from '../models/Plan';

const CompanyPlanController = {
  // Listar los planes asignados a una empresa
  async getPlansByCompany(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId;
      const companyPlans = await CompanyPlan.find({ company: companyId }).populate('plan');
      res.json(companyPlans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Asignar un plan a una empresa
  async assignPlanToCompany(req: Request, res: Response) {
    try {
      const { company, plan, start_date, payment_due_date, payment_status } = req.body;
      const assignment = await CompanyPlan.create({
        company,
        plan,
        start_date,
        payment_due_date,
        payment_status: payment_status || 'pendiente',
      });
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Cambiar el estado de pago de un plan asignado
  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { payment_status } = req.body;
      const updated = await CompanyPlan.findByIdAndUpdate(
        req.params.id,
        { payment_status },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Asignación no encontrada' });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar la asignación de un plan a una empresa
  async deleteCompanyPlan(req: Request, res: Response) {
    try {
      const deleted = await CompanyPlan.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Asignación no encontrada' });
      res.json({ message: 'Asignación eliminada' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default CompanyPlanController; 