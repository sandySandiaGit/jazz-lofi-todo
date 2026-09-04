import { schema as s } from "jazz-tools";

// 1. Global Schema Definition:
const schema = {
  // A. Categories Table:
  categories: s.table({
    name: s.string(),
    color: s.string(), 
    iconKey: s.string(), 
  }),

  // B. Todos Table:
  todos: s.table({
    title: s.string(),
    done: s.boolean(),
    // Foreign key link to the categories table:
    // The "Id" suffix is strictly mandatory per Jazz conventions!
    categoryId: s.ref("categories").optional(), 
  }),
};

// 2. Export Typed Application (Jazz Mini-ORM Layer)
// Explicitly provide type inference to keep defineApp safe:
type AppSchema = s.Schema<typeof schema>;
export const app: s.App<AppSchema> = s.defineApp(schema);

// 3. Export TypeScript Types => utilized by React Components:
export type Todo = s.RowOf<typeof app.todos>;
export type Category = s.RowOf<typeof app.categories>;
