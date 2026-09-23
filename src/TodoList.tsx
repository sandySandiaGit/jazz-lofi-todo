import { useState, useEffect } from "react";
import { useAll, useDb } from "jazz-tools/react";
import { app, type Todo, type Category } from "./schema.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faFilePen, faTrashCan, faPlus, faBriefcase, faHouse, faCircleCheck, faCircleDot, faChevronDown} from "@fortawesome/free-solid-svg-icons";

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

export default function TodoList() {

  const db = useDb();

  const { data: todos = [], isLoading: isTodosLoading } = useAll(app?.todos);
  const { data: categories = [], isLoading: isCategoriesLoading } = useAll(app?.categories);

  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeFilterName, setActiveFilterName] = useState<string>("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [hasCheckedInit, setHasCheckedInit] = useState(false);

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
        console.warn("Lie-fi détected (timeout) !");
      } else {
        console.warn("Offline or network error !");
      }
      return false;
    }
  };

  // Initialisation sécurisée des catégories par défaut:
  useEffect(() => {
    if (hasCheckedInit || isCategoriesLoading || !categories) return;

    if (categories.length === 0) {
      db.insert(app.categories, { name: "Personal", color: "pink", iconKey: "house" });
      db.insert(app.categories, { name: "Work", color: "marine", iconKey: "briefcase" });
    }
    setHasCheckedInit(true);
  }, [categories, isCategoriesLoading, db, hasCheckedInit]);

  // Test de connexion réseau:
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
    return (
      <p className="text-center text-slate-400 py-8 animate-pulse">
        Initializing Jazz schema...
      </p>
    );
  }

  if (isTodosLoading || isCategoriesLoading) {
    return (
      <p className="text-center text-slate-400 py-8 animate-pulse">
        Loading and syncing...
      </p>
    );
  }

  // Déduplication des catégories:
  const uniqueCategories = categories.filter(
    (cat: Category, index: number, self: Category[]) =>
      cat && self.findIndex((c: Category) => c.name === cat.name) === index
  );

  const filteredTodos = todos
    .filter((todo): todo is Todo => Boolean(todo && todo.id))
    .filter((todo) => {
      if (activeFilterName === "All") return true;
      if (!todo.categoryId) return false;

      const validCategoryIds = categories
        .filter((c) => c && c.name === activeFilterName)
        .map((c) => c.id);

      return validCategoryIds.includes(todo.categoryId);
    });

  const handleAddTodo = (e: React.BaseSyntheticEvent) => {

    e.preventDefault();
    
    if (!newTodoTitle.trim()) return;

    db.insert(app.todos, {
      title: newTodoTitle,
      done: false,
      categoryId: selectedCategoryId,
    });

    setNewTodoTitle("");
    setSelectedCategoryId(undefined);
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

  const selectedCategoryName = categories?.find((c: Category) => c.id === selectedCategoryId)?.name;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-8">
      <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-2xl py-6 px-3 sm:px-6">
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

        {/* Formulaire de création: */}
        <form onSubmit={handleAddTodo} className="flex flex-col mb-6 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={30}
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Add a collaborative task..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-900 text-sm text-blue-900"
            />
            <button
              type="submit"
               className="flex items-center justify-center gap-1 bg-blue-900 font-extrabold text-white transition-colors hover:bg-pink-600 
              h-8 w-8 rounded-full text-xs sm:h-auto sm:w-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          {/* Select de catégorie: */}
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full font-bold flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-blue-900 outline-none text-left cursor-pointer"
            >
              <span>{selectedCategoryName || "No category"}</span>
              <FontAwesomeIcon icon={faChevronDown} className="text-blue-900 text-[10px]" />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden z-20 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(undefined);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left font-bold px-3 py-2 text-xs text-blue-900 hover:bg-slate-50 cursor-pointer"
                  >
                    No category
                  </button>
                  {uniqueCategories.map((cat: Category) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left font-bold px-3 py-2 text-xs text-blue-900 hover:bg-blue-50 cursor-pointer"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </form>

        {/* Filtres par catégorie: */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
           <button
            onClick={() => setActiveFilterName("All")}
            className={`rounded-full px-2 py-1 text-xs transition-colors cursor-pointer whitespace-nowrap sm:px-3 sm:py-1 sm:font-extrabold 
              ${ activeFilterName === "All"
                ? "bg-blue-900 text-white font-extrabold"
                : "bg-slate-100 text-blue-900 hover:bg-slate-200 font-normal"
              }`}
          >
            All ({todos?.length || 0})
          </button>

          {uniqueCategories.map((cat: Category) => {
            const validIds = categories?.filter((c: Category) => c.name === cat.name).map((c: Category) => c.id);
            const count = todos?.filter((t: Todo) => t.categoryId && validIds.includes(t.categoryId)).length;
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

        {/* Liste des tâches: */}
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
                        value={todo.title}
                        maxLength={30}
                        onChange={(e) => handleLiveEdit(todo.id, e.target.value)}
                        onBlur={() => setEditingId(null)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") setEditingId(null);
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

        {/* Modal de suppression: */}
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