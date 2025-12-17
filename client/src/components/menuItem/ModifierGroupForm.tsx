import React, { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '../common/Button';
import type { Modifier } from '../../hooks/useMenuItems';

interface ModifierGroupFormProps {
  modifiers: Modifier[];
  onChange: (modifiers: Modifier[]) => void;
}

export const ModifierGroupForm: React.FC<ModifierGroupFormProps> = ({ modifiers, onChange }) => {
  const [groupName, setGroupName] = useState('');
  const [modifierName, setModifierName] = useState('');
  const [modifierPrice, setModifierPrice] = useState('0');

  const addModifier = () => {
    if (!groupName.trim() || !modifierName.trim()) {
      alert('Please enter both group name and modifier name');
      return;
    }

    const price = parseFloat(modifierPrice) || 0;
    if (price < 0) {
      alert('Price cannot be negative');
      return;
    }

    const newModifier: Modifier = {
      id: `m-${Date.now()}`,
      name: modifierName.trim(),
      price: price,
      groupName: groupName.trim(),
    };

    onChange([...modifiers, newModifier]);

    // Reset only name and price, keep group name for easy adding
    setModifierName('');
    setModifierPrice('0');
  };

  const removeModifier = (id: string) => {
    onChange(modifiers.filter((m) => m.id !== id));
  };

  // Group modifiers by groupName
  const groupedModifiers = modifiers.reduce((acc, modifier) => {
    if (!acc[modifier.groupName]) {
      acc[modifier.groupName] = [];
    }
    acc[modifier.groupName].push(modifier);
    return acc;
  }, {} as Record<string, Modifier[]>);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addModifier();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-antiflash/50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-charcoal mb-3">Add Modifier</h4>

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

          {/* Modifier Name and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
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
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={addModifier}
            icon={PlusIcon}
            className="w-full"
          >
            Add Modifier
          </Button>
        </div>
      </div>

      {/* Display grouped modifiers */}
      {Object.keys(groupedModifiers).length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-charcoal">Current Modifiers</h4>

          {Object.entries(groupedModifiers).map(([group, mods]) => (
            <div key={group} className="bg-white border border-antiflash rounded-lg p-4">
              <h5 className="text-sm font-semibold text-charcoal mb-3 flex items-center">
                <span className="px-2 py-1 bg-naples/20 rounded text-xs mr-2">{group}</span>
                <span className="text-gray-600 text-xs">({mods.length} options)</span>
              </h5>

              <div className="space-y-2">
                {mods.map((modifier) => (
                  <div
                    key={modifier.id}
                    className="flex items-center justify-between p-2 bg-antiflash/30 rounded-md hover:bg-antiflash/50 transition-colors group"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-charcoal font-medium">{modifier.name}</span>
                      <span className="text-xs text-gray-600 ml-2">
                        {modifier.price > 0 ? `+$${modifier.price.toFixed(2)}` : 'Free'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeModifier(modifier.id)}
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
          <p className="text-gray-600 text-sm">No modifiers added yet</p>
          <p className="text-gray-500 text-xs mt-1">Add modifiers like Size options or Extra toppings</p>
        </div>
      )}

      {/* Info text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-900">
          <strong>Tip:</strong> Group modifiers by type (e.g., "Size" for Small/Medium/Large, "Extras" for add-ons).
          Customers will see these grouped together when ordering.
        </p>
      </div>
    </div>
  );
};
