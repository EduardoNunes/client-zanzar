import * as yup from "yup";

export const addressSchema = yup.object().shape({
  street: yup
    .string()
    .required("A rua é obrigatória.")
    .min(3, "A rua deve ter pelo menos 3 caracteres."),
  number: yup
    .string()
    .required("O número é obrigatório.")
    .matches(/^\d+$/, "O número deve conter apenas dígitos numéricos."),
  complement: yup.string().nullable(),
  neighborhood: yup
    .string()
    .required("O bairro é obrigatório.")
    .min(3, "O bairro deve ter pelo menos 3 caracteres."),
  city: yup
    .string()
    .required("A cidade é obrigatória.")
    .min(2, "A cidade deve ter pelo menos 2 caracteres."),
  state: yup
    .string()
    .required("O estado é obrigatório.")
    .length(2, "O estado deve ter exatamente 2 caracteres."),
  postalCode: yup
    .string()
    .required("O CEP é obrigatório.")
    .matches(/^\d{5}-\d{3}$/, "Preencha o CEP corretamente."),
  country: yup
    .string()
    .required("O país é obrigatório.")
    .min(3, "O país deve ter pelo menos 3 caracteres."),
});