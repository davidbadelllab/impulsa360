const db = require('../lib/db');

const LeadController = {
  async createLead(req, res) {
    try {
      const { client_id, social_network_id, status, notes } = req.body;
      const lead = await db('leads')
        .insert({ 
          client_id, 
          social_network_id, 
          status: status || 'new',
          notes
        })
        .returning('*');
      res.status(201).json(lead[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateLead(req, res) {
    try {
      const { status, notes } = req.body;
      const updated = await db('leads')
        .where({ id: req.params.id })
        .update({ 
          status,
          notes,
          last_contacted_at: db.fn.now() 
        })
        .returning('*');
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getLeadById(req, res) {
    try {
      const lead = await db('leads')
        .where({ id: req.params.id })
        .first();
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getLeadsByStatus(req, res) {
    try {
      const leads = await db('leads')
        .where({ status: req.params.status })
        .orderBy('last_contacted_at', 'desc');
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteLead(req, res) {
    try {
      await db('leads').where({ id: req.params.id }).del();
      res.json({ message: 'Lead deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = LeadController;
