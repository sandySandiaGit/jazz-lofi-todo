import { useState, useEffect } from "react";
import { useAll, useDb } from "jazz-tools/react"; 
import { app, type Todo, type Category } from "./schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePen, faTrashCan, faPlus, faBriefcase, faHouse, faCircleCheck , faCircleDot, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const CATEGORY_ICONS: Record<string, any> = {
  briefcase: faBriefcase,
  house: faHouse,
};

const CATEGORY_COLORS: Record<string, { activeBg: string; text: string; lightBg: string; border: string }> = {

  blue: {
    activeBg: "bg-blue-500",
    text: "text-blue-500 hover:text-blue-600",
    lightBg: "text-blue-600",
    border: "border-blue-300 focus:border-blue-500 focus:text-blue-00"
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
}

export default function TodoList() {

  const db = useDb();

  // Nouveau en alpha.55 : useAll retourne { data, ... } /!\
  // qu'il faut destructurer:
  //----GOOD const { data: todos = [] } = useAll(app.todos)
  //----GOOD const { data: categories = [] } = useAll(app.categories)

 // 1. Récupération réactive des données et des états de chargement:
  const { data: todos = [], isLoading: isTodosLoading } = useAll(app?.todos);
  const { data: categories = [], isLoading: isCategoriesLoading } = useAll(app?.categories);

  // Timeout de secours : après 1.5s, on affiche ce qu'on a:
  const [loadingTimedOut, setLoadingTimedOut] = useState(false)

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

  // Initialisation / Seeding des catégories:
  useEffect(() => {
    // To prevent duplicates: 
    // Guard clause: If we already verified/seeded this session, stop to prevent loops
    if (hasCheckedInit || !categories) return;

    // Give the Jazz Mesh sync a brief moment (400ms) to pull down existing cloud categories 
    // before assuming the database is completely brand new:
    const timer = setTimeout(() => {

      const hasPersonal = categories.some((cat: Category) => cat.name === "Personal");
      const hasWork = categories.some((cat: Category) => cat.name === "Work");
     
      if (!hasPersonal) {
        db.insert(app.categories, { name: "Personal", color: "pink", iconKey: "house" });
      }

      if (!hasWork) {
        db.insert(app.categories, { name: "Work", color: "marine", iconKey: "briefcase" });
      }

      setHasCheckedInit(true);
      
    }, 400);

    return () => clearTimeout(timer);

  }, [categories, db, hasCheckedInit]);

  useEffect(() => {
    if (!isTodosLoading && !isCategoriesLoading) return
    
    const timer = setTimeout(() => {
      console.warn("[Jazz] isLoading timeout — affichage forcé des données IDB")
      setLoadingTimedOut(true)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [isTodosLoading, isCategoriesLoading])

  // Reset du timeout si les données arrivent normalement:
  useEffect(() => {
    if (!isTodosLoading && !isCategoriesLoading) {
      setLoadingTimedOut(false)
    }
  }, [isTodosLoading, isCategoriesLoading])

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

  console.log("isTodosLoading:",isTodosLoading)
  console.log("isCategoriesLoading:",isCategoriesLoading)
  console.log("todos:",todos)
  console.log("categories:",categories)

  console.log("[Debug Jazz Reload]", {
    appPresent: !!app,
    todosRefPresent: !!app?.todos,
    todos,
    isTodosLoading,
    isCategoriesLoading,
  });

  if (!app) {
    return (
      <p className="text-center text-slate-400 py-8 animate-pulse">
        Restauration du compte depuis IndexedDB...
      </p>
    );
  }

  if (!app.todos || !app.categories) {
    return (
      <p className="text-center text-slate-400 py-8 animate-pulse">
        Initialisation de la structure...
      </p>
    );
  }

  // Ignorer isLoading si timeout atteint (via (isTodosLoading || isCategoriesLoading))
  // comme cela on a au moins les cat et on peut créer une task:
  if ((isTodosLoading || isCategoriesLoading) && !loadingTimedOut) {
    return (
      <p className="text-center text-slate-400 py-8 animate-pulse">
        Chargement des tâches...
      </p>
    )
  }

  // À partir d'ici, todos et categories contiennent ce qu'IDB a pu fournir:
  const filteredTodos = (todos || [])
    .filter((todo): todo is Todo => Boolean(todo && todo.id))
    .filter((todo) => {
      if (activeFilterName === "All") return true;
      if (!todo.categoryId) return false;

      const validCategoryIds = (categories || [])
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

  const handleDeleteTodo = (id: string) => {
    setTodoToDelete(id);
  };

  const confirmDeleteTodo = () => {
    if (todoToDelete) {
      db.delete(app.todos, todoToDelete);
      setTodoToDelete(null); // Close modal
    }
  };

  // Create a unique list of categories (keeping only the 1st occurrence of each name):
  const uniqueCategories = categories?.filter(
    (cat: Category, index: number, self: Category[]) => self.findIndex((c: Category) => c.name === cat.name) === index
  ) || [];

  const selectedCategoryName = categories?.find((c: Category) => c.id === selectedCategoryId)?.name;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-8">
      <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-2xl py-6 px-3 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilePen}  />
            <span >Tiny FullyLoFi To-Do</span>
          </h1>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-2.5 sm:py-1 rounded-full text-xs font-medium text-slate-500">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-blue-900' : 'bg-pink-500'}`}></span>
            <span className="hidden sm:inline" >{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
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
          {/* Categories select: */}
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full font-bold flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-blue-900 outline-none text-left"
            >
              <span>
                {/* Display the category name (even if it maps to a duplicate ID): */}
                {selectedCategoryName || "No category"}
              </span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className="text-blue-900 font-extrabold text-[10px] transition-transform duration-200" 
              />
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
                    className={`w-full text-left font-extrabold px-3 py-2 text-xs transition-colors 
                      ${ !selectedCategoryId ? "bg-blue-900 text-white" : "text-blue-900 hover:bg-slate-50"}`
                    }
                  >
                    No category
                  </button>

                  {/* Iterate strictly over the deduplicated categories list: */}
                  {uniqueCategories.map((cat: Category) => {
                    // Compare by NAME so that the active highlight works correctly even with duplicate IDs:
                    const isSelected = cat.name === selectedCategoryName;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left font-extrabold px-3 py-2 text-xs transition-colors 
                          ${isSelected ? "bg-blue-900 text-white font-extrabold" : "text-blue-900 hover:bg-blue-50"}`
                        }
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </form>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {/* Render category filter buttons: */}
          {/* 1. "All" Button: */}
          <button
            onClick={() => setActiveFilterName("All")}
            className={`rounded-full px-2 py-1 text-xs transition-colors whitespace-nowrap sm:px-3 sm:py-1 sm:font-extrabold 
              ${ activeFilterName === "All"
                ? "bg-blue-900 text-white font-extrabold"
                : "bg-slate-100 text-blue-900 hover:bg-slate-200 font-normal"
              }`}
          >
            All ({todos?.length || 0})
          </button>

          {/* 2. Category Buttons (Iterating over the DEDUPLICATED list): */}
          {uniqueCategories.map((cat: Category) => {
            // Count todos linked to ALL duplicates under this name to get the true total:
            const validIds = categories?.filter((c: Category) => c.name === cat.name).map((c: Category) => c.id) || [];
            // Prefix with 't.categoryId &&' to guarantee safe string passing to includes():
            const count = todos?.filter((t: Todo) => t.categoryId && validIds.includes(t.categoryId)).length || 0;
            const categoryIcon = CATEGORY_ICONS[cat.iconKey || ""] || faBriefcase;
            const styles = CATEGORY_COLORS[cat.color || "marine"] || CATEGORY_COLORS.marine;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilterName(cat.name)} 
                className={`rounded-full px-2 py-1 text-xs transition-colors whitespace-nowrap sm:px-3 sm:py-1 sm:font-extrabold 
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

        {filteredTodos === undefined ? (
          <p className="text-center text-sm text-slate-400 py-4">Loading tasks...</p>
        ) : filteredTodos.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No results found...
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredTodos.map((todo: Todo) => {
              const attachedCategory = categories?.find((c: Category) => c.id === todo.categoryId);
              const attachedIcon = CATEGORY_ICONS[attachedCategory?.iconKey || ""] || faBriefcase;
              const styles = CATEGORY_COLORS[attachedCategory?.color || "marine"] || CATEGORY_COLORS.marine;
              
              return (
                <li key={todo.id} className="flex flex-col p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 gap-1 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleTodo(todo.id, todo.done)}
                        className={`text-lg cursor-pointer transition-colors focus:outline-none ${styles.text}`}
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
                            if (e.key === 'Enter' || e.key === 'Escape') {
                              e.currentTarget.blur(); 
                            }
                          }}
                          className={`flex-1 bg-white px-2 py-0.5 border ${styles.border} rounded text-sm focus:outline-none`}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingId(todo.id)}
                          className={`text-sm cursor-pointer hover:${styles.text} transition-colors flex-1 ${todo.done ? "line-through text-slate-400 font-medium" : `${styles.text} font-extrabold`}`}
                        >
                          {todo.title} 
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {attachedCategory && (
                        <span className={`text-sm font-semibold ${styles.lightBg} whitespace-nowrap flex items-center gap-1.5`}>
                          <FontAwesomeIcon icon={attachedIcon} />
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-sm p-1 text-slate-400 hover:text-pink-500"
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="cursor-pointer"/>
                      </button>
                      {todoToDelete !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                          <div 
                            className="fixed inset-0 bg-blue-100/5 backdrop-blur-sm"
                            onClick={() => setTodoToDelete(null)} 
                          />
                          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 p-5 z-10 transform scale-100 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-100 text-sm">
                                <FontAwesomeIcon icon={faTrashCan} className="text-blue-900" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-blue-900">Delete this task?</h3>
                                <p className="text-xs text-blue-900 mt-0.5">This action cannot be undone.</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-5">
                              <button
                                type="button"
                                onClick={() => setTodoToDelete(null)}
                                className="cursor-pointer bg-blue-50 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-extrabold text-blue-900 hover:bg-blue-100 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={confirmDeleteTodo}
                                className="cursor-pointer px-3 py-1.5 bg-blue-900 hover:bg-pink-600 text-white font-extrabold rounded-xl text-xs font-extrabold transition-colors shadow-sm shadow-blue-200"
                              >
                                Delete Task
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}


