const db = require('../lib/db');

const ClientServiceController = {
  async assignServiceToClient(req, res) {
    try {
      const { client_id, service_id, start_date, end_date } = req.body;
      
      const clientService = await db('client_services')
        .insert({
          client_id,
          service_id,
          start_date,
          end_date
        })
        .returning('*');
        
      res.status(201).json(clientService[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getClientServices(req, res) {
    try {
      const services = await db('client_services')
        .where({ client_id: req.params.client_id })
        .join('services', 'client_services.service_id', 'services.id')
        .select(
          'client_services.*',
          'services.name as service_name',
          'services.description as service_description',
          'services.price_per_month'
        );
        
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateClientService(req, res) {
    try {
      const { end_date, is_active } = req.body;
      
      const updated = await db('client_services')
        .where({ id: req.params.id })
        .update({
          end_date,
          is_active
        })
        .returning('*');
        
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deactivateClientService(req, res) {
    try {
      await db('client_services')
        .where({ id: req.params.id })
        .update({ is_active: false });
        
      res.json({ message: 'Service deactivated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ClientServiceController;
