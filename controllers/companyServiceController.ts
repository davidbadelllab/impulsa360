const db = require('../lib/db');

const CompanyServiceController = {
  async assignServiceToCompany(req, res) {
    try {
      const { company_id, service_id, start_date, end_date } = req.body;
      
      const companyService = await db('company_services')
        .insert({
          company_id,
          service_id, 
          start_date,
          end_date
        })
        .returning('*');
        
      res.status(201).json(companyService[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCompanyServices(req, res) {
    try {
      const services = await db('company_services')
        .where({ company_id: req.params.company_id })
        .join('services', 'company_services.service_id', 'services.id')
        .select('company_services.*', 'services.name as service_name');
        
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCompanyServiceStatus(req, res) {
    try {
      const { is_active } = req.body;
      
      const updated = await db('company_services')
        .where({ id: req.params.id })
        .update({ is_active })
        .returning('*');
        
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deactivateCompanyService(req, res) {
    try {
      await db('company_services')
        .where({ id: req.params.id })
        .update({ is_active: false });
        
      res.json({ message: 'Service deactivated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = CompanyServiceController;
