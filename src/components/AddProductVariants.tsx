import { Trash } from 'lucide-react';
import React, { useState } from 'react';
import { ProductImageProps, ProductVariationsProps } from '../types/ProductVariant';
import { colorNames } from '../utils/colorNames';
import formatCurrencyInput from '../utils/formatRealCoin';
import ColorPickerWithName from './ColorPickerWithNames';

const initialVariantDraft: ProductVariationsProps & {
  tempSize?: string;
  tempStock?: string;
  tempBasePrice?: string;
  tempPrice?: string;
} = {
  id: "",
  productId: "",
  colorName: '',
  colorCode: '',
  images: [],
  sizes: [],
  tempSize: '',
  tempStock: '',
  tempBasePrice: '',
  tempPrice: '',
};

const ProductForm = ({
  variants,
  setVariants,
  productFeePercentage
}: {
  variants: ProductVariationsProps[];
  setVariants: (variants: ProductVariationsProps[]) => void;
  productFeePercentage?: number
}) => {

  const [variantDraft, setVariantDraft] = useState<ProductVariationsProps & {
    tempSize?: string;
    tempStock?: string;
    tempBasePrice?: string;
    tempPrice?: string;
  }>(initialVariantDraft);

  // Manipula campos do formulário temporário (draft)
  const handleVariantDraftFieldChange = (field: string, value: string) => {
    setVariantDraft(prev => ({ ...prev, [field]: value }));
  };

  // Adiciona a variante preenchida à lista e reseta o draft
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: "",
        productId: "",
        colorName: variantDraft.colorName,
        colorCode: variantDraft.colorCode,
        images: variantDraft.images,
        sizes: variantDraft.sizes,
      },
    ]);
    setVariantDraft(initialVariantDraft);
  }

  // Manipula imagens do draft
  const handleAddImageDraft = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArr = Array.from(files).slice(0, 3);
      const newImages: ProductImageProps[] = [...variantDraft.images];
      for (let i = 0; i < fileArr.length; i++) {
        if (newImages.length < 3) {
          const file = fileArr[i];
          const reader = new FileReader();
          reader.onloadend = () => {
            newImages.push({
              id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
              url: reader.result as string,
              file,
              position: newImages.length
            });
            setVariantDraft(prev => ({ ...prev, images: newImages }));
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Remove imagem do draft
  const handleRemoveImageDraft = (imgIndex: number) => {
    const newImages = [...variantDraft.images];
    newImages.splice(imgIndex, 1);
    setVariantDraft(prev => ({ ...prev, images: newImages }));
  };

  // Atualiza os inputs temporários de tamanho para o draft
  const handleTempSizeChangeDraft = (field: 'size' | 'stock' | 'basePrice' | 'price', value: string) => {
    setVariantDraft(prev => ({ ...prev, [`temp${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }));
  };

  // Handler especial para inputs de moeda do draft (aceita só números e armazena só os dígitos)
  const handleCurrencyInputChangeDraft = (field: 'basePrice' | 'price', formattedValue: string) => {
    const digits = formattedValue.replace(/\D/g, '');
    handleTempSizeChangeDraft(field, digits);
  };

  // Adiciona o tamanho preenchido à lista de tamanhos do draft e zera os inputs temporários
  const handleAddSizeToDraft = () => {
    setVariantDraft(prev => {
      const newSize = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
        size: prev.tempSize || '',
        stock: Number(prev.tempStock) || 0,
        basePrice: Number(prev.tempBasePrice) || 0,
        price: Number(prev.tempPrice) || 0,
      };
      if (!newSize.size) return prev;
      return {
        ...prev,
        sizes: [...prev.sizes, newSize],
        tempSize: '',
        tempStock: '',
        tempBasePrice: 'R$ 0,00',
        tempPrice: 'R$ 0,00',
      };
    });
  };

  // Função para checar se todos os campos obrigatórios da subvariação estão preenchidos
  const isAddInfoDisabled = !(
    variantDraft.tempSize &&
    variantDraft.tempStock &&
    variantDraft.tempBasePrice &&
    variantDraft.tempPrice
  );

  return (
    <form className="max-w-2xl mx-auto my-6 py-4">
      {/* Variantes */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Cadastrar Variante</h3>
        <p className="text-gray-600 mb-2">
          Preencha os dados da variante. Ao clicar em "Adicionar Variante", ela será listada abaixo e o formulário será limpo para novo cadastro.
        </p>
        <div className="mb-6">
          <div className="flex gap-4">
            <ColorPickerWithName
              variant={variantDraft}
              handleChange={(_, field, value) => {
                if (field === "color") {
                  const isHex = value.startsWith("#");
                  setVariantDraft(prev => ({
                    ...prev,
                    colorName: isHex ? (colorNames[value.toLowerCase()] || value) : value,
                    colorCode: isHex ? value : (Object.keys(colorNames).find(hex => colorNames[hex] === value) || value)
                  }));
                } else {
                  handleVariantDraftFieldChange(field, value);
                }
              }}
              index={0}
            />
          </div>

          {/* Imagens */}
          <div>
            <h4 className="font-medium">Imagens (máx 3 por cor)</h4>
            <div className="mt-2">
              <label className={`flex items-center justify-center w-full p-2 border rounded-lg bg-green-700 text-white font-semibold cursor-pointer hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${variantDraft.images.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ position: 'relative' }}>
                Selecionar imagens
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImageDraft}
                  disabled={variantDraft.images.length >= 3}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ zIndex: 2 }}
                />
              </label>
            </div>
            <div className="flex mt-2 gap-2">
              {variantDraft.images.map((image, imgIndex) => (
                <div key={imgIndex} className="relative">
                  <img
                    src={image.url}
                    alt={`Imagem ${imgIndex + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImageDraft(imgIndex)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tamanhos, estoque, preço base, preço final */}
          <div>
            <h4 className="font-medium mt-4">Informações adicionadas</h4>
            {variantDraft.sizes.length === 0 ? (
              <p className="text-gray-400 text-sm mb-2">Nenhum tamanho adicionado ainda.</p>
            ) : (
              <ul className="mb-2">
                {variantDraft.sizes.map((size, sizeIndex) => (
                  <li key={sizeIndex} className="flex gap-4 items-center border-b py-1 text-sm">
                    <span><b>Tamanho:</b> {size.size}</span>
                    <span><b>Estoque:</b> {size.stock}</span>
                    <span><b>Preço base:</b> {formatCurrencyInput(size.basePrice.toString())}</span>
                    <span><b>Preço final:</b> {formatCurrencyInput(size.price.toString())}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-2 my-2">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <label className="font-medium mb-1">Tamanho</label>
                  <input
                    type="text"
                    value={variantDraft.tempSize || ''}
                    onChange={e => handleTempSizeChangeDraft('size', e.target.value)}
                    className="p-2 w-full border rounded"
                    placeholder="Tamanho"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium mb-1">Estoque</label>
                  <input
                    type="number"
                    value={variantDraft.tempStock || ''}
                    onChange={e => handleTempSizeChangeDraft('stock', e.target.value)}
                    className="p-2 w-full border rounded"
                    placeholder="Estoque"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <label className="font-medium mb-1">Preço base</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formatCurrencyInput(variantDraft.tempBasePrice || '')}
                    onChange={e => {
                      const value = e.target.value;
                      handleCurrencyInputChangeDraft('basePrice', value);

                      // Extrai apenas os dígitos para garantir o valor numérico
                      const digits = value.replace(/\D/g, '');
                      const base = digits ? parseFloat(digits) / 100 : 0;
                      // Calcula o preço final e arredonda para baixo
                      const finalPriceCents = Math.floor(base * 1.05 * 100);
                      const finalPrice = finalPriceCents / 100;

                      handleCurrencyInputChangeDraft('price', finalPrice ? finalPrice.toFixed(2) : '');
                    }}
                    className="p-2 w-full border rounded"
                    placeholder="Preço base"
                    maxLength={15}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium mb-1">Preço final {productFeePercentage}%</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled
                    value={formatCurrencyInput(variantDraft.tempPrice || '')}
                    className="p-2 w-full border border-gray-300 rounded"
                    placeholder="Preço final"
                    maxLength={15}
                  />
                </div>

              </div>
              <button
                type="button"
                onClick={handleAddSizeToDraft}
                className={`px-4 py-2 rounded transition-all mt-1 ${isAddInfoDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-700 text-white hover:bg-green-800'}`}
                disabled={isAddInfoDisabled}
              >
                Adicionar informações
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddVariant}
          className="mt-4 w-full text-lg py-2 font-bold rounded bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg hover:from-green-700 hover:to-green-900 transition-all border-2 border-green-900"
        >
          Concluir variante
        </button>

        {/* Lista de variantes já cadastradas */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Variantes cadastradas</h3>
          {variants.length === 0 ? (
            <p className="text-gray-400 text-sm mb-2">Nenhuma variante cadastrada ainda.</p>
          ) : (
            variants.map((variant, index) => (
              <div key={index} className="mb-4 border p-2 rounded">
                <div className="flex items-center mb-2">
                  <p className="mr-2 font-bold">Cor: </p>
                  {variant.colorName}
                  <span style={{
                    backgroundColor: variant.colorCode,
                    display: 'inline-block',
                    width: 18, height: 18,
                    borderRadius: 9,
                    marginLeft: 6,
                    border: '1px solid #ccc'
                  }} />
                </div>
                <div className="mb-2 flex gap-2">
                  {variant.images.map((image, imgIndex) => (
                    <img key={imgIndex} src={image.url} alt={`img${imgIndex}`} className="w-10 h-10 object-cover rounded" />
                  ))}
                </div>
                <div>
                  <b>Informações:</b>
                  <ul>
                    {(variant.sizes ?? []).map((size, sizeIndex) => (
                      <li key={sizeIndex} className="flex gap-4 items-center text-sm">
                        <span><b>Tamanho:</b> {size.size}</span>
                        <span><b>Estoque:</b> {size.stock}</span>
                        <span><b>Preço base:</b> {formatCurrencyInput(size.basePrice.toString())}</span>
                        <span><b>Preço final:</b> {formatCurrencyInput(size.price.toString())}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
