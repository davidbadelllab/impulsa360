const db = require('../lib/db');
const { validationResult } = require('express-validator');

const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: error.message });
};

const SocialNetworkController = {
  // Conectar red social
  async connectSocialNetwork(req, res) {
    try {
      const { client_id, platform, metrics } = req.body;

      // Verificar que el cliente exista
      const client = await db('clients').where({ id: client_id }).first();
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const newSocialNetwork = await db('social_networks').insert({
        client_id,
        platform,
        metrics
      }).returning('*');
      
      res.status(201).json(newSocialNetwork[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Obtener redes sociales por cliente
  async getSocialNetworksByClient(req, res) {
    try {
      const socialNetworks = await db('social_networks')
        .where({ client_id: req.params.client_id })
        .select('*');
      
      res.json(socialNetworks);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Actualizar métricas de red social
  async updateSocialNetworkMetrics(req, res) {
    try {
      const { id } = req.params;
      const { metrics } = req.body;
      
      const updated = await db('social_networks')
        .where({ id })
        .update({ metrics })
        .returning('*');
        
      if (!updated.length) return res.status(404).json({ error: 'Social network not found' });
      res.json(updated[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Desconectar red social
  async disconnectSocialNetwork(req, res) {
    try {
      const deleted = await db('social_networks')
        .where({ id: req.params.id })
        .del()
        .returning('*');
        
      if (!deleted.length) return res.status(404).json({ error: 'Social network not found' });
      res.json({ message: 'Social network disconnected successfully' });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Obtener estadísticas de redes sociales
  async getSocialNetworkStats(req, res) {
    try {
      const stats = await db('social_networks')
        .where({ client_id: req.params.client_id })
        .select('platform', 'metrics');
      
      res.json(stats);
    } catch (error) {
      handleError(res, error);
    }
  }
};

module.exports = SocialNetworkController;
