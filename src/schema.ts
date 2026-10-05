import { schema as s } from "jazz-tools";

/**
 * JAZZ DATABASE SCHEMA (ORM-like !)
 * 
 * Defines the Local-First data model and relationships.
 * - One-to-Many: A Category can contain multiple Todos.
 * - Optional Relation: Todos can exist with or without a Category.
 */

const schema = {

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
};

// Infer the schema type and initialize the Jazz application context:
type AppSchema = s.Schema<typeof schema>;
export const app: s.App<AppSchema> = s.defineApp(schema);

// Export TypeScript row types for use inside React components:
export type Todo = s.RowOf<typeof app.todos>;
export type Category = s.RowOf<typeof app.categories>;