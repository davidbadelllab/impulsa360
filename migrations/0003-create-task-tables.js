export async function up(knex) {
  // Tabla de tableros (boards)
  await knex.schema.createTable('boards', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.integer('company_id').references('id').inTable('companies');
    table.integer('created_by').references('id').inTable('users');
    table.boolean('is_archived').defaultTo(false);
    table.timestamps(true, true);
  });

  // Tabla de listas (lists)
  await knex.schema.createTable('lists', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('board_id').references('id').inTable('boards').onDelete('CASCADE');
    table.integer('position').defaultTo(0);
    table.boolean('is_archived').defaultTo(false);
    table.timestamps(true, true);
  });

  // Tabla de etiquetas (labels)
  await knex.schema.createTable('labels', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('color').defaultTo('#0079bf');
    table.integer('board_id').references('id').inTable('boards').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Tabla de tarjetas (cards)
  await knex.schema.createTable('cards', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.integer('list_id').references('id').inTable('lists').onDelete('CASCADE');
    table.integer('position').defaultTo(0);
    table.date('due_date');
    table.boolean('is_archived').defaultTo(false);
    table.integer('created_by').references('id').inTable('users');
    table.timestamps(true, true);
  });

  // Tabla de asignaciones de tarjetas (card_assignments)
  await knex.schema.createTable('card_assignments', (table) => {
    table.increments('id').primary();
    table.integer('card_id').references('id').inTable('cards').onDelete('CASCADE');
    table.integer('user_id').references('id').inTable('users');
    table.timestamps(true, true);
  });

  // Tabla de etiquetas de tarjetas (card_labels)
  await knex.schema.createTable('card_labels', (table) => {
    table.increments('id').primary();
    table.integer('card_id').references('id').inTable('cards').onDelete('CASCADE');
    table.integer('label_id').references('id').inTable('labels').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Tabla de comentarios (comments)
  await knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();
    table.text('content').notNullable();
    table.integer('card_id').references('id').inTable('cards').onDelete('CASCADE');
    table.integer('user_id').references('id').inTable('users');
    table.timestamps(true, true);
  });

  // Tabla de checklists (checklists)
  await knex.schema.createTable('checklists', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.integer('card_id').references('id').inTable('cards').onDelete('CASCADE');
    table.integer('position').defaultTo(0);
    table.timestamps(true, true);
  });

  // Tabla de items de checklist (checklist_items)
  await knex.schema.createTable('checklist_items', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.boolean('is_completed').defaultTo(false);
    table.integer('checklist_id').references('id').inTable('checklists').onDelete('CASCADE');
    table.integer('position').defaultTo(0);
    table.timestamps(true, true);
  });

  // Tabla de archivos adjuntos (attachments)
  await knex.schema.createTable('attachments', (table) => {
    table.increments('id').primary();
    table.string('filename').notNullable();
    table.string('original_name').notNullable();
    table.string('mime_type');
    table.integer('size');
    table.string('url');
    table.integer('card_id').references('id').inTable('cards').onDelete('CASCADE');
    table.integer('uploaded_by').references('id').inTable('users');
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('attachments');
  await knex.schema.dropTableIfExists('checklist_items');
  await knex.schema.dropTableIfExists('checklists');
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('card_labels');
  await knex.schema.dropTableIfExists('card_assignments');
  await knex.schema.dropTableIfExists('cards');
  await knex.schema.dropTableIfExists('labels');
  await knex.schema.dropTableIfExists('lists');
  await knex.schema.dropTableIfExists('boards');
} 