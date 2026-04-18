"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Plus, Trash2, Save, Printer } from "lucide-react";

type Unit = "oz" | "lb" | "g" | "kg" | "cups" | "tbsp" | "tsp" | "each" | "ml" | "L";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  pricePaid: number;
  packageSize: number;
  packageUnit: Unit;
}

interface Recipe {
  id: string;
  name: string;
  servings: number;
  ingredients: Ingredient[];
}

const UNITS: Unit[] = ["oz", "lb", "g", "kg", "cups", "tbsp", "tsp", "each", "ml", "L"];

const newIngredient = (): Ingredient => ({
  id: crypto.randomUUID(),
  name: "",
  quantity: 1,
  unit: "each",
  pricePaid: 0,
  packageSize: 1,
  packageUnit: "each",
});

const newRecipe = (name = "My Recipe"): Recipe => ({
  id: crypto.randomUUID(),
  name,
  servings: 4,
  ingredients: [newIngredient()],
});

const ingredientCost = (ing: Ingredient): number => {
  if (ing.packageSize <= 0 || ing.pricePaid <= 0) return 0;
  const costPerUnit = ing.pricePaid / ing.packageSize;
  return costPerUnit * ing.quantity;
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STORAGE_KEY = "devpick_recipes";

export function RecipeCostCalculatorTool() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => [newRecipe()]);
  const [activeId, setActiveId] = useState<string>(() => "");
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
  });

  // Set initial activeId once on mount
  const effectiveActiveId = activeId || recipes[0]?.id || "";

  const activeRecipe = recipes.find((r) => r.id === effectiveActiveId) ?? recipes[0];

  const updateRecipe = (id: string, update: Partial<Recipe>) =>
    setRecipes((rs) => rs.map((r) => (r.id === id ? { ...r, ...update } : r)));

  const updateIngredient = (recipeId: string, ingId: string, update: Partial<Ingredient>) =>
    setRecipes((rs) =>
      rs.map((r) =>
        r.id === recipeId
          ? { ...r, ingredients: r.ingredients.map((i) => (i.id === ingId ? { ...i, ...update } : i)) }
          : r
      )
    );

  const addIngredient = (recipeId: string) =>
    setRecipes((rs) =>
      rs.map((r) => (r.id === recipeId ? { ...r, ingredients: [...r.ingredients, newIngredient()] } : r))
    );

  const removeIngredient = (recipeId: string, ingId: string) =>
    setRecipes((rs) =>
      rs.map((r) =>
        r.id === recipeId ? { ...r, ingredients: r.ingredients.filter((i) => i.id !== ingId) } : r
      )
    );

  const addRecipe = () => {
    const r = newRecipe(`Recipe ${recipes.length + 1}`);
    setRecipes((rs) => [...rs, r]);
    setActiveId(r.id);
  };

  const removeRecipe = (id: string) => {
    setRecipes((rs) => {
      const next = rs.filter((r) => r.id !== id);
      if (next.length === 0) return [newRecipe()];
      return next;
    });
    if (activeId === id) setActiveId("");
  };

  const saveRecipe = (recipe: Recipe) => {
    const next = savedRecipes.filter((r) => r.id !== recipe.id).concat(recipe);
    setSavedRecipes(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const loadRecipe = (recipe: Recipe) => {
    if (!recipes.find((r) => r.id === recipe.id)) {
      setRecipes((rs) => [...rs, recipe]);
    }
    setActiveId(recipe.id);
  };

  const deleteSaved = (id: string) => {
    const next = savedRecipes.filter((r) => r.id !== id);
    setSavedRecipes(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const recipe = activeRecipe;
  const totalCost = recipe ? recipe.ingredients.reduce((sum, i) => sum + ingredientCost(i), 0) : 0;
  const costPerServing = recipe && recipe.servings > 0 ? totalCost / recipe.servings : 0;

  const inputClass =
    "px-2 py-1.5 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono";

  return (
    <ToolLayout
      agentReady
      title="Recipe Cost Calculator"
      description="Calculate the exact cost of any recipe and cost-per-serving. Add ingredients with quantities and prices to get a full breakdown."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {recipes.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  activeId === r.id
                    ? "bg-accent text-white"
                    : "bg-surface-raised border border-border-subtle text-text-secondary hover:border-accent"
                }`}
              >
                {r.name}
              </button>
            ))}
            <button onClick={addRecipe} className="action-btn text-xs flex items-center gap-1.5">
              <Plus size={13} /> Add Recipe
            </button>
          </div>

          {recipe && (
            <div className="bg-card-bg border border-card-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <input
                  value={recipe.name}
                  onChange={(e) => updateRecipe(recipe.id, { name: e.target.value })}
                  className="text-lg font-semibold bg-transparent border-b border-border-subtle text-text-primary focus:outline-none focus:border-accent flex-1 py-1"
                  placeholder="Recipe name"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-secondary font-mono">Servings:</label>
                  <input
                    type="number"
                    min={1}
                    value={recipe.servings}
                    onChange={(e) => updateRecipe(recipe.id, { servings: Number(e.target.value) })}
                    className={inputClass + " w-16"}
                  />
                </div>
                <button
                  onClick={() => saveRecipe(recipe)}
                  className="action-btn text-xs flex items-center gap-1.5"
                  title="Save to localStorage"
                >
                  <Save size={13} /> Save
                </button>
                <button
                  onClick={() => window.print()}
                  className="action-btn text-xs flex items-center gap-1.5"
                  title="Print"
                >
                  <Printer size={13} />
                </button>
                {recipes.length > 1 && (
                  <button
                    onClick={() => removeRecipe(recipe.id)}
                    className="text-text-muted hover:text-red-400 p-1"
                    title="Remove recipe"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Ingredients Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-text-muted font-mono uppercase border-b border-border-subtle">
                      <th className="text-left py-2 pr-2">Ingredient</th>
                      <th className="text-left py-2 pr-2 w-20">Qty</th>
                      <th className="text-left py-2 pr-2 w-20">Unit</th>
                      <th className="text-left py-2 pr-2 w-24">Price Paid</th>
                      <th className="text-left py-2 pr-2 w-20">Pkg Size</th>
                      <th className="text-left py-2 pr-2 w-20">Pkg Unit</th>
                      <th className="text-right py-2 w-20">Cost</th>
                      <th className="py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.ingredients.map((ing) => {
                      const cost = ingredientCost(ing);
                      const pct = totalCost > 0 ? (cost / totalCost) * 100 : 0;
                      return (
                        <tr key={ing.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-subtle">
                          <td className="py-2 pr-2">
                            <input
                              placeholder="e.g. Flour"
                              value={ing.name}
                              onChange={(e) => updateIngredient(recipe.id, ing.id, { name: e.target.value })}
                              className={inputClass + " w-full"}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={ing.quantity}
                              onChange={(e) => updateIngredient(recipe.id, ing.id, { quantity: Number(e.target.value) })}
                              className={inputClass + " w-full"}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <select
                              value={ing.unit}
                              onChange={(e) => updateIngredient(recipe.id, ing.id, { unit: e.target.value as Unit })}
                              className={inputClass + " w-full"}
                            >
                              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td className="py-2 pr-2">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={ing.pricePaid}
                                onChange={(e) => updateIngredient(recipe.id, ing.id, { pricePaid: Number(e.target.value) })}
                                className={inputClass + " w-full pl-5"}
                              />
                            </div>
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={ing.packageSize}
                              onChange={(e) => updateIngredient(recipe.id, ing.id, { packageSize: Number(e.target.value) })}
                              className={inputClass + " w-full"}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <select
                              value={ing.packageUnit}
                              onChange={(e) => updateIngredient(recipe.id, ing.id, { packageUnit: e.target.value as Unit })}
                              className={inputClass + " w-full"}
                            >
                              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td className="py-2 text-right">
                            <div className="font-mono text-sm text-text-primary">{fmt(cost)}</div>
                            <div className="text-xs text-text-muted">{pct.toFixed(1)}%</div>
                          </td>
                          <td className="py-2 pl-1">
                            <button
                              onClick={() => removeIngredient(recipe.id, ing.id)}
                              className="text-text-muted hover:text-red-400 p-0.5"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => addIngredient(recipe.id)}
                className="mt-3 action-btn text-xs flex items-center gap-1.5"
              >
                <Plus size={13} /> Add Ingredient
              </button>

              {/* Cost Summary */}
              <div className="mt-5 pt-4 border-t border-border-subtle grid grid-cols-2 gap-4">
                <div className="text-center bg-surface-subtle rounded-xl p-4">
                  <div className="text-xs text-text-muted mb-1 uppercase font-mono tracking-wide">Total Cost</div>
                  <div className="text-2xl font-bold text-accent font-mono">{fmt(totalCost)}</div>
                </div>
                <div className="text-center bg-surface-subtle rounded-xl p-4">
                  <div className="text-xs text-text-muted mb-1 uppercase font-mono tracking-wide">Cost / Serving</div>
                  <div className="text-2xl font-bold text-accent font-mono">{fmt(costPerServing)}</div>
                  <div className="text-xs text-text-muted">{recipe.servings} servings</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved Recipes Sidebar */}
        <div className="space-y-4">
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">💾 Saved Recipes</h2>
            {savedRecipes.length === 0 ? (
              <p className="text-xs text-text-muted">No saved recipes yet. Hit Save to store recipes in your browser.</p>
            ) : (
              <div className="space-y-2">
                {savedRecipes.map((r) => {
                  const total = r.ingredients.reduce((s, i) => s + ingredientCost(i), 0);
                  return (
                    <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border-subtle hover:bg-surface-subtle">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-primary truncate">{r.name}</div>
                        <div className="text-xs text-text-muted font-mono">{fmt(total)} · {r.servings} servings</div>
                      </div>
                      <button onClick={() => loadRecipe(r)} className="action-btn text-xs py-1 px-2">Load</button>
                      <button onClick={() => deleteSaved(r.id)} className="text-text-muted hover:text-red-400 p-0.5">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-surface-subtle border border-border-subtle rounded-xl p-4 text-xs text-text-muted leading-relaxed">
            <strong className="text-text-secondary block mb-1">💡 Tips</strong>
            <ul className="space-y-1 list-disc list-inside">
              <li>Package size = how much comes in the container you bought</li>
              <li>Units must match (e.g. both oz, or both g)</li>
              <li>Use <strong className="text-text-secondary">each</strong> for items like eggs or apples</li>
              <li>Saved recipes persist across browser sessions</li>
            </ul>
          </div>

          {/* Related Tools */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-2">Related Tools</h2>
            <p className="text-xs text-text-muted mb-3">
              Build a full pricing workflow from ingredient costing to client billing and final documents.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Freelance Rate Calculator", href: "/freelance-rate-calculator" },
                { name: "Invoice Generator", href: "/invoice-generator" },
                { name: "Number Formatter", href: "/number-format" },
                { name: "Word to PDF", href: "/word-to-pdf" },
                { name: "PDF Watermark", href: "/pdf-watermark" },
              ].map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]"
                >
                  {tool.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
