const db = require('../lib/db');
const { validationResult } = require('express-validator');

const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: error.message });
};

const ClientController = {
  // Crear cliente
  async createClient(req, res) {
    try {
      const { company_id, name, email, phone } = req.body;

      // Verificar que la compañía exista
      const company = await db('companies').where({ id: company_id }).first();
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const newClient = await db('clients').insert({
        company_id,
        name,
        email,
        phone
      }).returning('*');
      
      res.status(201).json(newClient[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Obtener clientes por compañía
  async getClientsByCompany(req, res) {
    try {
      const clients = await db('clients')
        .where({ company_id: req.params.company_id })
        .select('*');
      
      res.json(clients);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Obtener cliente con redes sociales
  async getClientWithSocialNetworks(req, res) {
    try {
      const client = await db('clients')
        .where({ 'clients.id': req.params.id })
        .first();
      
      if (!client) return res.status(404).json({ error: 'Client not found' });

      const socialNetworks = await db('social_networks')
        .where({ client_id: req.params.id })
        .select('*');

      res.json({ ...client, social_networks: socialNetworks });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Actualizar cliente
  async updateClient(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;
      
      const updated = await db('clients')
        .where({ id })
        .update({ name, email, phone })
        .returning('*');
        
      if (!updated.length) return res.status(404).json({ error: 'Client not found' });
      res.json(updated[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Eliminar cliente
  async deleteClient(req, res) {
    try {
      // Verificar si tiene redes sociales asociadas
      const socialNetworks = await db('social_networks')
        .where({ client_id: req.params.id });
      
      if (socialNetworks.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete client with associated social networks' 
        });
      }
      
      const deleted = await db('clients')
        .where({ id: req.params.id })
        .del()
        .returning('*');
        
      if (!deleted.length) return res.status(404).json({ error: 'Client not found' });
      res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      handleError(res, error);
    }
  }
};

module.exports = ClientController;
