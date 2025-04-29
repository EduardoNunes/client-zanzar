import * as yup from "yup";

export const addProductSchema = yup.object({
  name: yup
    .string()
    .required("Insira um nome para o produto"),
  description: yup
    .string()
    .required("Insira uma descrição para o produto"),
  selectedSubCategory: yup
    .string()
    .required("Selecione uma subcategoria"),
  selectedCategory: yup
    .string()
    .required("Selecione uma categoria"),
  variants: yup
    .array()
    .min(1, "Cadastre pelo menos uma variante do produto")
    .required("Cadastre pelo menos uma variante do produto"),
});

export const addProductVariantSchema = yup.object({
  preco: yup
    .number()
    .min(1, "Insira um preço base")
    .required("Insira um preço base"),
  estoque: yup
    .number()
    .min(1, "Insira uma quantidade em estoque")
    .required("Insira uma quantidade em estoque"),
  tamanho: yup
    .string()
    .required("Selecione um tamanho, caso não se apliquem variações selecione digite 'Único'"),
});