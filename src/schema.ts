import { schema as s } from "jazz-tools";

const schema = {

    todos: s.table({
        categoryId: s.uuid().optional(),
        title: s.string(),
        done: s.boolean(),
    },
    {
        category: s.rel("categories", "categoryId"),
    }),

    categories: s.table({
        name: s.string(),
        color: s.string(),
        iconKey: s.string(),
    },
    {
        // Fait référence à la relation "category" définie dans la table "todos":
        todos: s.reverse("todos", "category"),
    }),
};

type AppSchema = s.Schema<typeof schema>;
export const app: s.App<AppSchema> = s.defineApp(schema);

export type Todo = s.RowOf<typeof app.todos>;
export type Category = s.RowOf<typeof app.categories>;