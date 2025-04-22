const db = require('../lib/db');

const PlanController = {
  async createPlan(req, res) {
    try {
      const { name, description, status, company_id, team_id } = req.body;
      const created_by = req.user.id;
      
      const plan = await db('plans')
        .insert({
          name,
          description,
          status,
          created_by,
          company_id,
          team_id
        })
        .returning('*');
        
      res.status(201).json(plan[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPlansByCompany(req, res) {
    try {
      const plans = await db('plans')
        .where({ company_id: req.params.company_id })
        .orderBy('created_at', 'desc');
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updatePlanStatus(req, res) {
    try {
      const updated = await db('plans')
        .where({ id: req.params.id })
        .update({ status: req.body.status })
        .returning('*');
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deletePlan(req, res) {
    try {
      await db('plans').where({ id: req.params.id }).del();
      res.json({ message: 'Plan deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = PlanController;
