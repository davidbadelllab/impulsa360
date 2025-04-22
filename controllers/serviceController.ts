const db = require('../lib/db');

const ServiceController = {
  async createService(req, res) {
    try {
      const { name, description, price_per_month } = req.body;
      
      const service = await db('services')
        .insert({
          name,
          description,
          price_per_month
        })
        .returning('*');
        
      res.status(201).json(service[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllServices(req, res) {
    try {
      const services = await db('services').orderBy('name', 'asc');
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getServiceById(req, res) {
    try {
      const service = await db('services')
        .where({ id: req.params.id })
        .first();
      
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateService(req, res) {
    try {
      const { name, description, price_per_month } = req.body;
      
      const updated = await db('services')
        .where({ id: req.params.id })
        .update({
          name,
          description,
          price_per_month
        })
        .returning('*');
        
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteService(req, res) {
    try {
      await db('services').where({ id: req.params.id }).del();
      res.json({ message: 'Service deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ServiceController;
