import { CopyPlus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

type Variant = {
  color: string;
  size: string;
  stock: number;
  price: number;
  priceWithTax: number;
  images: string[];
};

export default function AddProductVariants({
  variants,
  setVariants,
  productFeePercentage }:
  { variants: Variant[], setVariants: (variants: Variant[]) => void, productFeePercentage?: number }) {
console.log("VARIANTS", variants)

  const handleChange = (
    index: number,
    field: keyof Variant,
    value: string | number | string[]
  ) => {
    const updatedVariants = [...variants];
    if (field === "color" || field === "size") {
      updatedVariants[index][field] = value as string;
    } else if (field === "stock" || field === "price" || field === "priceWithTax") {
      updatedVariants[index][field] = value as number;
    } else if (field === "images") {
      updatedVariants[index][field] = value as string[];
    }
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    for (const variant of variants) {
      if (variant.stock === 0 || variant.price === 0) {  
        toast.info("Os campos 'Estoque' e 'Preço base' são obrigatórios")
        return;
      }
      
      if (variant.images.length === 0) {
        toast.info("Adicione pelo menos uma imagem")
        return;
      }
    }

    setVariants([
      ...variants,
      { color: "", size: "", stock: 0, price: 0, priceWithTax: 0, images: [] },
    ]);
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const CopyVariant = (index: number) => {
    const variantToCopy = variants[index];

    const updatedVariants = [...variants];
    const lastIndex = updatedVariants.length - 1;

    updatedVariants[lastIndex] = {
      ...variantToCopy,
      images: [...variantToCopy.images], // garante cópia independente
    };

    setVariants(updatedVariants);
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].images = updatedVariants[variantIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    setVariants(updatedVariants);
  };

  return (
    <div className="w-full mt-6">
      <h2 className="text-2xl font-bold mb-4">Variantes do Produto</h2>

      {variants.map((variant, index) => {
        const isLast = index === variants.length - 1;

        const priceInReais = variant.price / 100;
        const rawPriceWithTaxInCents = Math.floor(variant.price * (1 + (productFeePercentage || 0) / 100));
        const priceWithTaxInReais = rawPriceWithTaxInCents / 100;

        const formatCurrency = (value: number) =>
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(value);

        return (
          <div
            key={index}
            className="relative flex flex-col gap-4 w-full border p-4 mb-4 rounded-lg bg-gray-50"
          >
            {isLast ? (
              // Inputs para edição
              <>
                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-1/2">
                    <label className="font-medium mb-1">Cor:</label>
                    <input
                      value={variant.color}
                      onChange={(e) => handleChange(index, "color", e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div className="flex flex-col w-1/2">
                    <label className="font-medium mb-1">Tamanho:</label>
                    <input
                      value={variant.size}
                      onChange={(e) => handleChange(index, "size", e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </div>

                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-1/2">
                    <label className="font-medium mb-1">Estoque:</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleChange(index, "stock", e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div className="flex flex-col w-1/2">
                    <label className="font-medium mb-1">Preço base:</label>
                    <input
                      type="text"
                      value={formatCurrency(priceInReais)}
                      onChange={(e) => {
                        const raw = parseFloat(e.target.value.replace(/[^\d]/g, ""));
                        handleChange(index, "price", isNaN(raw) ? 0 : raw);
                      }}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </div>

                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-1/2">
                    <label className="font-medium mb-1">Preço com taxa: {productFeePercentage}%</label>
                    <input
                      type="text"
                      value={formatCurrency(priceWithTaxInReais)}
                      readOnly
                      className="border p-2 rounded w-full bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div className="flex flex-col items-center w-1/2">
                    <span className="text-gray-600 text-sm">A taxa padrão é de 5%. Para negociação, entre em contato com o suporte</span>
                  </div>
                </div>

                {/* Input de imagens */}
                <div className="flex flex-col w-full">
                  <label className="mb-2 cursor-pointer inline-block bg-blue-600 text-center text-white px-4 py-2 rounded hover:bg-blue-700">
                    Selecionar imagens
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files) return;

                        const newFiles = Array.from(files);
                        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

                        const currentImages = variant.images || [];
                        const updatedImages = [...currentImages, ...newPreviews].slice(0, 3); // limite de 3

                        handleChange(index, "images", updatedImages);
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {(variant.images || []).slice(0, 3).map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={img}
                          alt={`preview-${i}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          title="Remover imagem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full text-sm space-y-2">
                {/* Miniatura clicável da primeira imagem */}
                {variant.images?.[0] && (
                  <div className="mb-2">
                    <img
                      src={variant.images[0]}
                      alt="Variante"
                      className="w-20 h-20 rounded object-cover border cursor-pointer"
                      onClick={() => window.open(variant.images?.[0], "_blank")}
                    />
                  </div>
                )}
                <p><strong>Cor:</strong> {variant.color}</p>
                <p><strong>Tamanho:</strong> {variant.size}</p>
                <p><strong>Estoque:</strong> {variant.stock}</p>
                <p><strong>Preço base:</strong> {formatCurrency(priceInReais)}</p>
                <p><strong>Preço com taxa ({productFeePercentage}%):</strong> {formatCurrency(priceWithTaxInReais)}</p>
              </div>
            )}

            {variants.length > 1 && !isLast && (
              <button
                onClick={() => removeVariant(index)}
                className="absolute top-2 right-4 text-red-500 font-medium mt-2"
              >
                <Trash2 size={24} />
              </button>
            )}
            {variants.length > 1 && !isLast && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  CopyVariant(index);
                }}
                className="absolute top-12 right-4 font-medium mt-2"
              >
                <CopyPlus size={24} />
              </button>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addVariant}
        className="mt-2 mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Adicionar Variante
      </button>
    </div>
  );
}