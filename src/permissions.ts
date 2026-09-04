import { schema as s } from "jazz-tools";
import { app } from "./schema"; 

export default s.definePermissions(app, ({ policy }) => {
  // Allow all reads and writes on the tables:
  policy.todos.allowRead.always();
  policy.todos.allowInsert.always();
  policy.todos.allowUpdate.always();
  policy.todos.allowDelete.always();

  policy.categories.allowRead.always();
  policy.categories.allowInsert.always();
  policy.categories.allowUpdate.always();
  policy.categories.allowDelete.always();
});
