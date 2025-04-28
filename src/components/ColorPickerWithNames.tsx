import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { colorNames } from "../utils/colorNames";

interface ColorPickerWithNameProps {
  variant: any;
  handleChange: (index: number, field: string, value: string) => void;
  index: number;
}

import { useEffect } from "react";

export default function ColorPickerWithName({ variant, handleChange, index }: ColorPickerWithNameProps) {
  const [selectedColorName, setSelectedColorName] = useState(variant.colorName || "");
  const [query, setQuery] = useState("");
  const [colorHex, setColorHex] = useState(variant.colorCode || "#facc15");

  useEffect(() => {
    setSelectedColorName(variant.colorName || "");
    setColorHex(variant.colorCode || "#facc15");
  }, [variant.colorName, variant.colorCode]);

  const colorOptions = Object.entries(colorNames).map(([hex, name]) => ({ hex, name }));

  const filteredColors =
    query === ""
      ? colorOptions
      : colorOptions.filter((color) =>
        color.name.toLowerCase().includes(query.toLowerCase())
      );

  const handleColorSelect = (color: { hex: string; name: string }) => {
    setSelectedColorName(color.name);
    setColorHex(color.hex);
    handleChange(index, "color", color.name);
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setColorHex(newHex);
    const foundName = colorNames[newHex.toLowerCase()];
    if (foundName) {
      setSelectedColorName(foundName);
      handleChange(index, "color", foundName);
    } else {
      setSelectedColorName(newHex);
      handleChange(index, "color", newHex);
    }
  };

  return (
    <div className="flex justify-between w-full">
      <div className="flex flex-col">
        <label className="font-medium mb-1">Cor:</label>
        <Combobox value={selectedColorName} onChange={handleColorSelect}>
          <div className="relative">
            <Combobox.Input
              className="border p-2 rounded w-full"
              displayValue={(colorName: string) => colorName}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite ou escolha uma cor"
            />
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg z-10">
              {filteredColors.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nenhuma cor encontrada.
                </div>
              ) : (
                filteredColors.map((color) => (
                  <Combobox.Option
                    key={color.hex}
                    value={color}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-yellow-100 text-yellow-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`absolute left-2 top-2 h-5 w-5 rounded-full`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {color.name}
                        </span>
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>


      {/* Color Picker separado */}
      <div className="flex flex-col">
        <input
          type="color"
          value={colorHex}
          onChange={handleColorPickerChange}
          className="mt-2 w-16 h-16 border-none cursor-pointer self-center"
        />

        <div className="text-center mt-2">
          <p className="text-gray-600">Cor selecionada:</p>
          <p className="font-bold" style={{ color: colorHex }}>
            {selectedColorName}
          </p>
        </div>
      </div>
    </div>
  );
}
