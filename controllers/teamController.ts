const db = require('../lib/db');
const { validationResult } = require('express-validator');

const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: error.message });
};

const TeamController = {
  // Crear equipo
  async createTeam(req, res) {
    try {
      const { company_id, name } = req.body;

      // Verificar que la compañía exista
      const company = await db('companies').where({ id: company_id }).first();
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const newTeam = await db('teams').insert({
        company_id,
        name
      }).returning('*');
      
      res.status(201).json(newTeam[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Obtener equipos por compañía
  async getTeamsByCompany(req, res) {
    try {
      const teams = await db('teams')
        .where({ company_id: req.params.company_id })
        .select('*');
      
      res.json(teams);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Obtener equipo con miembros
  async getTeamWithMembers(req, res) {
    try {
      const team = await db('teams')
        .where({ 'teams.id': req.params.id })
        .first();
      
      if (!team) return res.status(404).json({ error: 'Team not found' });

      const members = await db('team_members')
        .join('users', 'team_members.user_id', 'users.id')
        .where({ team_id: req.params.id })
        .select('users.*', 'team_members.role');
      
      res.json({ ...team, members });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Actualizar equipo
  async updateTeam(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      const updated = await db('teams')
        .where({ id })
        .update({ name })
        .returning('*');
        
      if (!updated.length) return res.status(404).json({ error: 'Team not found' });
      res.json(updated[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Eliminar equipo
  async deleteTeam(req, res) {
    try {
      // Primero eliminar miembros del equipo
      await db('team_members')
        .where({ team_id: req.params.id })
        .del();
      
      // Luego eliminar el equipo
      const deleted = await db('teams')
        .where({ id: req.params.id })
        .del()
        .returning('*');
        
      if (!deleted.length) return res.status(404).json({ error: 'Team not found' });
      res.json({ message: 'Team deleted successfully' });
    } catch (error) {
      handleError(res, error);
    }
  }
};

module.exports = TeamController;
