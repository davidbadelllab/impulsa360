const db = require('../lib/db');

const ActivityController = {
  async logActivity(req, res) {
    try {
      const { user_id, description, company_id, team_id } = req.body;
      const activity = await db('activities')
        .insert({
          user_id,
          description,
          company_id,
          team_id
        })
        .returning('*');
      res.status(201).json(activity[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getActivitiesByUser(req, res) {
    try {
      const activities = await db('activities')
        .where({ user_id: req.params.user_id })
        .orderBy('created_at', 'desc');
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getActivitiesByTeam(req, res) {
    try {
      const activities = await db('activities')
        .where({ team_id: req.params.team_id })
        .orderBy('created_at', 'desc');
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getActivitiesByCompany(req, res) {
    try {
      const activities = await db('activities')
        .where({ company_id: req.params.company_id })
        .orderBy('created_at', 'desc');
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteActivity(req, res) {
    try {
      await db('activities').where({ id: req.params.id }).del();
      res.json({ message: 'Activity deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ActivityController;
