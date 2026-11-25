import { schema as s } from "jazz-tools"

/**
 * JAZZ DATABASE SCHEMA (ORM-like !)
 * 
 * Defines the Local-First data model and relationships.
 * - One-to-Many: A Category can contain multiple Todos.
 * - Optional Relation: Todos can exist with or without a Category.
 */

export const schema = s.defineSchema({

  todos: s.table({

    // Raw optional foreign key required for s.rel:
    categoryId: s.uuid().optional(),
    title: s.string(),
    done: s.boolean(),
  },
  {
    // Foreign key relation pointing to the 'categories' table:
    category: s.rel("categories", "categoryId"),
  }),

  categories: s.table({
    name: s.string(),
    color: s.string(),
    iconKey: s.string(),
  },
  {
    // Reverse relation mapping: resolves all Todos linked to this Category
    todos: s.reverse("todos", "category"),
  }),
});

const { definePermissions } = schema;

export const permissions = definePermissions({
  categories: {
    read: true,
    insert: true,
    update: true,
    delete: true,
  },
  todos: {
    read: true,
    insert: true,
    update: true,
    delete: true,
  },
});
