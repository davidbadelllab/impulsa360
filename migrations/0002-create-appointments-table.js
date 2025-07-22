exports.up = function(knex) {
  return knex.schema.createTable('appointments', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('company');
    table.string('phone');
    table.date('date').notNullable();
    table.time('time').notNullable();
    table.enum('type', ['video', 'phone', 'presencial']).defaultTo('video');
    table.text('message');
    table.enum('status', ['pending', 'confirmed', 'completed', 'cancelled']).defaultTo('pending');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('appointments');
}; 