const db = require('../lib/db');

const NotificationController = {
  async createNotification(req, res) {
    try {
      const { user_id, message } = req.body;
      const notification = await db('notifications')
        .insert({ user_id, message })
        .returning('*');
      res.status(201).json(notification[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getUserNotifications(req, res) {
    try {
      const notifications = await db('notifications')
        .where({ user_id: req.params.user_id })
        .orderBy('created_at', 'desc');
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const updated = await db('notifications')
        .where({ id: req.params.id })
        .update({ is_read: true })
        .returning('*');
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteNotification(req, res) {
    try {
      await db('notifications').where({ id: req.params.id }).del();
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = NotificationController;
