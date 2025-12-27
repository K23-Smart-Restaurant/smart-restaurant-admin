import React, { useState } from "react";
import { PlusIcon, Trash2Icon, SlidersHorizontalIcon } from "lucide-react";
import { Button } from "../common/Button";
import type { ModifierGroupFormState, ModifierOptionInput } from "../../hooks/useMenuItems";

interface ModifierGroupFormProps {
  modifiers: ModifierGroupFormState[];
  onChange: (modifiers: ModifierGroupFormState[]) => void;
}

const buildTempId = (prefix: string) => `${prefix}-${Date.now()}`;

export const ModifierGroupForm: React.FC<ModifierGroupFormProps> = ({ modifiers, onChange }) => {
  const [groupName, setGroupName] = useState("");
  const [selectionType, setSelectionType] = useState<"single" | "multiple">("single");
  const [isRequired, setIsRequired] = useState(false);
  const [minSelections, setMinSelections] = useState<number>(0);
  const [maxSelections, setMaxSelections] = useState<number>(1);
  const [modifierName, setModifierName] = useState("");
  const [modifierPrice, setModifierPrice] = useState("0");
  const [modifierStatus, setModifierStatus] = useState<"active" | "inactive">("active");

  const resetInputs = () => {
    setModifierName("");
    setModifierPrice("0");
    setModifierStatus("active");
  };

  const normalizeSelectionBounds = (
    selection: "single" | "multiple",
    min: number,
    max: number
  ) => {
    if (selection === "single") {
      return { minSelections: 1, maxSelections: 1 };
    }
    const normalizedMin = Math.max(0, min || 0);
    const normalizedMax = max ? Math.max(normalizedMin, max) : undefined;
    return { minSelections: normalizedMin, maxSelections: normalizedMax };
  };

  const addModifier = () => {
    if (!groupName.trim() || !modifierName.trim()) {
      // Silently return - required fields will show validation on blur
      return;
    }

    const price = parseFloat(modifierPrice) || 0;
    if (price < 0) {
      // Silently return - validation handled by input type
      return;
    }

    const existingIndex = modifiers.findIndex(
      (group) => group.name.toLowerCase() === groupName.trim().toLowerCase()
    );
    const option: ModifierOptionInput = {
      id: buildTempId("opt"),
      name: modifierName.trim(),
      price,
      status: modifierStatus,
      displayOrder: existingIndex >= 0 ? modifiers[existingIndex].options.length : 0,
    };

    const bounds = normalizeSelectionBounds(selectionType, minSelections, maxSelections ?? 0);

    if (existingIndex >= 0) {
      const updated = modifiers.map((group, idx) => {
        if (idx !== existingIndex) return group;
        return {
          ...group,
          selectionType,
          isRequired,
          minSelections: bounds.minSelections,
          maxSelections: bounds.maxSelections,
          options: [...group.options, option],
        };
      });
      onChange(updated);
    } else {
      const newGroup: ModifierGroupFormState = {
        id: buildTempId("grp"),
        name: groupName.trim(),
        selectionType,
        isRequired,
        minSelections: bounds.minSelections,
        maxSelections: bounds.maxSelections,
        displayOrder: modifiers.length,
        status: "active",
        options: [option],
      };
      onChange([...modifiers, newGroup]);
    }

    resetInputs();
  };

  const updateGroup = (
    id: string,
    updater: (group: ModifierGroupFormState) => ModifierGroupFormState
  ) => {
    const updated = modifiers.map((group) =>
      group.id === id || group.name === id ? updater(group) : group
    );
    onChange(updated);
  };

  const removeModifier = (groupId: string, optionId: string) => {
    const updated = modifiers
      .map((group) => {
        if (group.id !== groupId && group.name !== groupId) return group;
        return { ...group, options: group.options.filter((opt) => opt.id !== optionId) };
      })
      .filter((group) => group.options.length > 0);
    onChange(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addModifier();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-antiflash/50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-charcoal mb-3">Add Modifier Group & Options</h4>

        <div className="space-y-3">
          {/* Group Name */}
          <div>
            <label htmlFor="groupName" className="block text-xs font-medium text-charcoal mb-1">
              Group Name (e.g., Size, Extras, Toppings)
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-white text-black px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none text-sm"
              placeholder="Size"
            />
          </div>

          {/* Selection rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">Selection Type</label>
              <select
                value={selectionType}
                onChange={(e) => setSelectionType(e.target.value as "single" | "multiple")}
                className="w-full bg-white text-black px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none text-sm"
              >
                <option value="single">Single select</option>
                <option value="multiple">Multi select</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                id="isRequired"
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="w-4 h-4 text-naples bg-gray-200 border-antiflash rounded focus:ring-naples focus:ring-2"
              />
              <label htmlFor="isRequired" className="text-sm text-charcoal">
                Required group
              </label>
            </div>
          </div>

          {/* Min/Max selections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">Min selections</label>
              <input
                type="number"
                min={0}
                value={selectionType === "single" ? 1 : minSelections}
                onChange={(e) => setMinSelections(Number(e.target.value))}
                disabled={selectionType === "single"}
                className="w-full bg-white text-black px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none text-sm disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">Max selections</label>
              <input
                type="number"
                min={1}
                value={selectionType === "single" ? 1 : maxSelections}
                onChange={(e) => setMaxSelections(Number(e.target.value))}
                disabled={selectionType === "single"}
                className="w-full bg-white text-black px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none text-sm disabled:opacity-60"
              />
            </div>
          </div>

          {/* Modifier Name and Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-1">
              <label htmlFor="modifierName" className="block text-xs font-medium text-charcoal mb-1">
                Modifier Name
              </label>
              <input
                id="modifierName"
                type="text"
                value={modifierName}
                onChange={(e) => setModifierName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-white text-black px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none text-sm"
                placeholder="Large"
              />
            </div>

            <div>
              <label htmlFor="modifierPrice" className="block text-xs font-medium text-charcoal mb-1">
                Additional Price ($)
              </label>
              <input
                id="modifierPrice"
                type="number"
                step="0.01"
                value={modifierPrice}
                onChange={(e) => setModifierPrice(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-white text-black px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none text-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">Status</label>
              <select
                value={modifierStatus}
                onChange={(e) => setModifierStatus(e.target.value as "active" | "inactive")}
                className="w-full bg-white text-black px-3 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={addModifier}
            icon={PlusIcon}
            className="w-full"
          >
            Add Modifier Option
          </Button>
        </div>
      </div>

      {/* Display grouped modifiers */}
      {modifiers.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-charcoal">Current Modifier Groups</h4>

          {modifiers.map((group) => (
            <div key={group.id || group.name} className="bg-white border border-antiflash rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-charcoal flex items-center gap-2">
                    <span className="px-2 py-1 bg-naples/20 rounded text-xs">{group.name}</span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <SlidersHorizontalIcon className="w-3 h-3" />
                      {group.selectionType === "single" ? "Single select" : "Multi select"}
                    </span>
                  </h5>
                  <p className="text-xs text-gray-600">
                    {group.isRequired ? "Required" : "Optional"} • Min {group.minSelections ?? 0} / Max {group.maxSelections ?? "∞"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Delete Group Button */}
                  <button
                    type="button"
                    onClick={() => {
                      // Delete without confirmation - user can undo by not saving the form
                      onChange(modifiers.filter(g => g.id !== group.id && g.name !== group.name));
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                    title="Delete entire group"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1">
                      <span className="text-gray-600">Required</span>
                      <input
                        type="checkbox"
                        checked={group.isRequired}
                        onChange={(e) =>
                          updateGroup(group.id || group.name, (g) => ({ ...g, isRequired: e.target.checked }))
                        }
                        className="w-4 h-4 text-naples bg-gray-200 border-antiflash rounded focus:ring-naples focus:ring-2"
                      />
                    </label>
                    <select
                      value={group.selectionType}
                      onChange={(e) =>
                        updateGroup(group.id || group.name, (g) =>
                          e.target.value === "single"
                            ? { ...g, selectionType: "single", minSelections: 1, maxSelections: 1 }
                            : { ...g, selectionType: "multiple", minSelections: g.minSelections ?? 0, maxSelections: g.maxSelections ?? 1 }
                        )
                      }
                      className="bg-gray-200 text-black px-2 py-1 rounded-md text-xs"
                    >
                      <option value="single">Single</option>
                      <option value="multiple">Multiple</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      value={group.selectionType === "single" ? 1 : group.minSelections ?? 0}
                      onChange={(e) =>
                        updateGroup(group.id || group.name, (g) => {
                          const nextMin = Math.max(0, Number(e.target.value));
                          const nextMax = g.maxSelections ?? nextMin;
                          return {
                            ...g,
                            minSelections: nextMin,
                            maxSelections: Math.max(nextMin, nextMax),
                          };
                        })
                      }
                      className="w-16 bg-gray-200 text-black px-2 py-1 rounded-md text-xs"
                      title="Min selections"
                      disabled={group.selectionType === "single"}
                    />
                    <input
                      type="number"
                      min={1}
                      value={group.selectionType === "single" ? 1 : group.maxSelections ?? 1}
                      onChange={(e) =>
                        updateGroup(group.id || group.name, (g) => {
                          const nextMax = Math.max(1, Number(e.target.value));
                          const nextMin = g.minSelections ?? 0;
                          return {
                            ...g,
                            maxSelections: Math.max(nextMax, nextMin || 0),
                          };
                        })
                      }
                      className="w-16 bg-gray-200 text-black px-2 py-1 rounded-md text-xs"
                      title="Max selections"
                      disabled={group.selectionType === "single"}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {group.options.map((modifier) => (
                  <div
                    key={modifier.id}
                    className="flex items-center justify-between p-2 bg-antiflash/30 rounded-md hover:bg-antiflash/50 transition-colors group"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-charcoal font-medium">{modifier.name}</span>
                      <span className="text-xs text-gray-600 ml-2">
                        {modifier.price > 0 ? `+$${modifier.price.toFixed(2)}` : "Free"}
                      </span>
                      <span className="text-xs ml-2 px-2 py-1 rounded-full border border-antiflash text-gray-700">
                        {modifier.status === "inactive" ? "Inactive" : "Active"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeModifier(group.id || group.name, modifier.id || "")}
                      className="p-1 text-red-600 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove modifier"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-antiflash rounded-lg p-8 text-center">
          <p className="text-gray-600 text-sm">No modifier groups added yet</p>
          <p className="text-gray-500 text-xs mt-1">Add groups like Size or Extras, then add options to each</p>
        </div>
      )}

      {/* Info text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-900">
          <strong>Tip:</strong> Use single-select for choices like Size (Small/Medium/Large) and multi-select with
          min/max rules for add-ons (Toppings, Extras). Required groups ensure guests make a choice before checkout.
        </p>
      </div>
    </div>
  );
};
