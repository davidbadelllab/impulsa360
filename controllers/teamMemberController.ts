const db = require('../lib/db');
const { validationResult } = require('express-validator');

const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: error.message });
};

const TeamMemberController = {
  // Agregar miembro al equipo
  async addTeamMember(req, res) {
    try {
      const { team_id, user_id, role } = req.body;

      // Verificar que el equipo y usuario existan
      const team = await db('teams').where({ id: team_id }).first();
      const user = await db('users').where({ id: user_id }).first();
      
      if (!team) return res.status(404).json({ error: 'Team not found' });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const newMember = await db('team_members').insert({
        team_id,
        user_id,
        role
      }).returning('*');
      
      res.status(201).json(newMember[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Actualizar rol de miembro
  async updateTeamMemberRole(req, res) {
    try {
      const { team_id, user_id } = req.params;
      const { role } = req.body;
      
      const updated = await db('team_members')
        .where({ team_id, user_id })
        .update({ role })
        .returning('*');
        
      if (!updated.length) return res.status(404).json({ error: 'Team member not found' });
      res.json(updated[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Eliminar miembro del equipo
  async removeTeamMember(req, res) {
    try {
      const { team_id, user_id } = req.params;
      
      const deleted = await db('team_members')
        .where({ team_id, user_id })
        .del()
        .returning('*');
        
      if (!deleted.length) return res.status(404).json({ error: 'Team member not found' });
      res.json({ message: 'Team member removed successfully' });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Obtener equipos de un usuario
  async getUserTeams(req, res) {
    try {
      const teams = await db('team_members')
        .join('teams', 'team_members.team_id', 'teams.id')
        .where({ user_id: req.params.user_id })
        .select('teams.*', 'team_members.role');
      
      res.json(teams);
    } catch (error) {
      handleError(res, error);
    }
  }
};

module.exports = TeamMemberController;
