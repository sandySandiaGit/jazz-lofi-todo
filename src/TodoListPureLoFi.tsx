import { useState, useEffect, useRef } from "react";
import { useAll, useDb } from "jazz-tools/react";
import { app, type Todo, type Category } from "./schema.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faFilePen, faTrashCan, faPlus, faBriefcase, faHouse,faCircleCheck, faCircleDot} from "@fortawesome/free-solid-svg-icons";

/**
 * APPROACH 2: Pure Local-First Component (Uncontrolled / Native HTML)
 * 
 * ADVANTAGES:
 * - NO useState declarations: The browser DOM manages the typing state natively.
 * - ZERO unnecessary re-renders while typing: Typing does NOT trigger React renders.
 * - Native FormData API extracts input value cleanly on form submission.
 * - Native e.currentTarget.reset() clears the form instantly.
 * - Direct Reactive Persistence: Jazz useAll() listens directly to IndexedDB.
 */

const CATEGORY_ICONS: Record<string, any> = {
  briefcase: faBriefcase,
  house: faHouse,
};

const CATEGORY_COLORS: Record<string, { activeBg: string; text: string; lightBg: string; border: string }> = {

  blue: {
    activeBg: "bg-blue-500",
    text: "text-blue-500 hover:text-blue-600",
    lightBg: "text-blue-600",
    border: "border-blue-300 focus:border-blue-500 focus:text-blue-500"
  },
  indigo: {
    activeBg: "bg-indigo-600",
    text: "text-indigo-600 hover:text-indigo-700",
    lightBg: "text-indigo-600",
    border: "border-indigo-300 focus:border-indigo-600 focus:text-indigo-600"
  },
  pink: {
    activeBg: "bg-pink-500",
    text: "text-pink-500 hover:text-pink-600",
    lightBg: "text-pink-500",
    border: "border-pink-300 focus:border-pink-500 focus:text-pink-500"
  },
  marine: {
    activeBg: "bg-blue-900",
    text: "text-blue-900 hover:text-blue-900",
    lightBg: "text-blue-900",
    border: "border-blue-300 focus:border-blue-900 focus:text-blue-900"
  },
  orange: {
    activeBg: "bg-orange-500",
    text: "text-orange-500 hover:text-orange-600",
    lightBg: "text-orange-600",
    border: "border-orange-300 focus:border-orange-500 focus:text-orange-500"
  }
};

export default function TodoListPureLoFi() {

  const db = useDb();

  // Directly subscribe to Jazz reactive data stream (Single Source of Truth):
  const { data: todos = [], isLoading: isTodosLoading } = useAll(app?.todos);
  const { data: categories = [], isLoading: isCategoriesLoading } = useAll(app?.categories);

  // Purely ephemeral UI state:
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFilterName, setActiveFilterName] = useState<string>("All");
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Use a ref instead of useState to avoid unnecessary re-renders:
  const hasCheckedInit = useRef(false);

  // Safely initialize default categories:
  useEffect(() => {
    if (hasCheckedInit.current || isCategoriesLoading || !categories) return;

    if (categories.length === 0) {
      db.insert(app.categories, { name: "Personal", color: "pink", iconKey: "house" });
      db.insert(app.categories, { name: "Work", color: "marine", iconKey: "briefcase" });
    }
    hasCheckedInit.current = true;
  }, [categories, isCategoriesLoading, db]);

  const checkRealConnection = async (timeout = 3000): Promise<boolean> => {

    if (!navigator.onLine) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      await fetch("https://httpbin.org", {
        method: "HEAD",
        cache: "no-store", 
        mode: "no-cors", 
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log("We're really online !!!");

      return true; 

    } catch (error: any) {

      if (error.name === 'AbortError') {
        console.warn("Lie-fi detected (timeout) !");
      } else {
        console.warn("Offline or network error !");
      }
      return false;
    }
  };

  // Network connection test:
  useEffect(() => {

    // Run the check immediately on mount:
    const triggerCheck = async () => {
      const result = await checkRealConnection();
      setIsOnline(result);
    };
    
    triggerCheck();

    // Re-verify connection health every 10 seconds automatically:
    const intervalId = setInterval(triggerCheck, 10000);

    // Also run immediately if the browser fires a native state switch event:
    const handleOnlineEvent = () => triggerCheck();
    const handleOfflineEvent = () => setIsOnline(false);

    window.addEventListener("online", handleOnlineEvent);
    window.addEventListener("offline", handleOfflineEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnlineEvent);
      window.removeEventListener("offline", handleOfflineEvent);
    };
  }, []);

  if (!app || !app.todos || !app.categories) {
    return <p className="text-center text-slate-400 py-8 animate-pulse">Initialisation de la structure Jazz...</p>;
  }

  if (isTodosLoading || isCategoriesLoading) {
    return <p className="text-center text-slate-400 py-8 animate-pulse">Chargement et synchronisation...</p>;
  }

  // --- CRUD ACTIONS (Zero useState needed for the form !!) ---
  const handleAddTodo = (e: React.BaseSyntheticEvent) => {

    e.preventDefault();

    // 1. Extract values using native Browser API (no React state needed):
    const formData = new FormData(e.currentTarget);
    const title = formData.get("todoTitle")?.toString().trim();
    const categoryId = formData.get("todoCategory")?.toString();

    if (!title) return;

    // 2. Persist directly to local database (syncs to memory & disk instantly):
    db.insert(app.todos, {
      title,
      done: false,
      categoryId: categoryId || undefined,
    });

    // 3. Reset form input and select using native HTML DOM method:
    e.currentTarget.reset(); 
  };

  const toggleTodo = (id: string, currentStatus: boolean) => {
    db.update(app.todos, id, { done: !currentStatus });
  };

  const handleLiveEdit = (id: string, newText: string) => {
    db.update(app.todos, id, { title: newText });
  };

  const confirmDeleteTodo = () => {
    if (todoToDelete) {
      db.delete(app.todos, todoToDelete);
      setTodoToDelete(null);
    }
  };

  const uniqueCategories = categories.filter(
    (cat: Category, index: number, self: Category[]) =>
      cat && self.findIndex((c: Category) => c.name === cat.name) === index
  );

  const filteredTodos = todos
    .filter((todo): todo is Todo => Boolean(todo && todo.id))
    .filter((todo) => {
      if (activeFilterName === "All") return true;
      if (!todo.categoryId) return false;
      const validCategoryIds = categories.filter((c) => c && c.name === activeFilterName).map((c) => c.id);
      return validCategoryIds.includes(todo.categoryId);
    });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-8">
      <div className="w-full max-w-md mx-auto bg-blue-500 shadow-xl rounded-2xl py-6 px-3 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilePen} />
            <span>Tiny FullyLoFi To-Do</span>
          </h1>
           <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-2.5 sm:py-1 rounded-full text-xs font-medium text-slate-500">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-blue-900' : 'bg-pink-500'}`}></span>
            <span className="hidden sm:inline" >{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Uncontrolled Form (Native HTML only): */}
        <form onSubmit={handleAddTodo} className="flex flex-col mb-6 gap-2">
          <div className="flex gap-2">
            <input
              name="todoTitle" // Identified natively by name attribute
              type="text"
              maxLength={30}
              placeholder="Add a collaborative task..."
              required
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-blue-900 text-sm text-blue-900"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1 bg-blue-900 font-extrabold text-white transition-colors hover:bg-pink-600 
              h-8 w-8 rounded-full text-xs sm:h-auto sm:w-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <select
            name="todoCategory"
            className="
              /* 1. Base & Typography */
              w-full appearance-none cursor-pointer rounded-xl font-bold text-xs text-blue-900
              /* 2. Padding & Layout */
              px-4 py-1.5 pr-10 border border-slate-200 bg-slate-50 shadow-sm
              /* 3. Focus & Transitions */
              focus:outline-none focus:ring-3 focus:ring-blue-900 focus:border-transparent
              /* 4. Custom blue SVG chevron (%231e3a8a = blue-900) */
              bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231e3a8a%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
              bg-[length:1.1rem_1.1rem] bg-[right_0.75rem_center] bg-no-repeat
            "
          >
            <option value="" className="bg-white text-slate-400 font-normal">
              No category
            </option>

            {uniqueCategories.map((cat: Category) => (
              <option 
                key={cat.id} 
                value={cat.id} 
                className="bg-white text-slate-900 font-medium py-1"
              >
                {cat.name}
              </option>
            ))}
          </select>

        </form>

        {/* Filter by category: */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveFilterName("All")}

            className={`rounded-full px-2 py-1 text-xs transition-colors cursor-pointer whitespace-nowrap sm:px-3 sm:py-1 sm:font-extrabold 
              ${ activeFilterName === "All"
                ? "bg-blue-900 text-white font-extrabold"
                : "bg-slate-100 text-blue-900 hover:bg-slate-200 font-normal"
              }`}
          >
            All ({todos.length})
          </button>

          {uniqueCategories.map((cat: Category) => {
            const validIds = categories.filter((c: Category) => c.name === cat.name).map((c: Category) => c.id);
            const count = todos.filter((t: Todo) => t.categoryId && validIds.includes(t.categoryId)).length;
            const categoryIcon = CATEGORY_ICONS[cat.iconKey || ""] || faBriefcase;
            const styles = CATEGORY_COLORS[cat.color || "marine"] || CATEGORY_COLORS.marine;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilterName(cat.name)}
                 className={`rounded-full px-2 py-1 text-xs transition-colors cursor-pointer whitespace-nowrap sm:px-3 sm:py-1 sm:font-extrabold 
                  ${ activeFilterName === cat.name
                    ? `${styles.activeBg} text-white font-extrabold`
                    : `${styles.text} bg-slate-100 hover:bg-slate-200 font-normal`
                  }`}
              >
                <FontAwesomeIcon icon={categoryIcon} className="mr-1" />
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Todos List: */}
        {filteredTodos.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No tasks found.
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredTodos.map((todo: Todo) => {
              const attachedCategory = categories.find((c: Category) => c.id === todo.categoryId);
              const attachedIcon = CATEGORY_ICONS[attachedCategory?.iconKey || ""] || faBriefcase;
              const styles = CATEGORY_COLORS[attachedCategory?.color || "marine"] || CATEGORY_COLORS.marine;

              return (
                <li key={todo.id} className="flex items-center justify-between p-3 text-blue-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTodo(todo.id, todo.done)}
                      className={`text-lg cursor-pointer ${styles.text}`}
                    >
                      <FontAwesomeIcon icon={todo.done ? faCircleCheck : faCircleDot} />
                    </button>

                    {editingId === todo.id ? (
                      <input
                        type="text"
                        defaultValue={todo.title}
                        maxLength={30}
                        onBlur={(e) => {
                          handleLiveEdit(todo.id, e.target.value);
                          setEditingId(null);
                        }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleLiveEdit(todo.id, e.currentTarget.value);
                            setEditingId(null);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className={`flex-1 bg-white px-2 py-0.5 border ${styles.border} rounded text-sm outline-none`}
                      />
                    ) : (
                      <span
                        onClick={() => setEditingId(todo.id)}
                        className={`text-sm cursor-pointer flex-1 ${
                          todo.done ? "line-through text-slate-400 font-medium" : `${styles.text} font-bold`
                        }`}
                      >
                        {todo.title}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {attachedCategory && (
                      <span className={`text-sm font-semibold ${styles.lightBg}`}>
                        <FontAwesomeIcon icon={attachedIcon} />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setTodoToDelete(todo.id)}
                      className="text-sm p-1 text-slate-400 hover:text-pink-500 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Delete Modal: */}
        {todoToDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setTodoToDelete(null)} />
            <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 p-5 z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 text-sm">
                  <FontAwesomeIcon icon={faTrashCan} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-pink-500">Delete this task?</h3>
                  <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setTodoToDelete(null)}
                  className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTodo}
                  className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}