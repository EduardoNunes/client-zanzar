import React, { useState, useEffect } from "react";
import AddressForm from "./AddressForm";
import formatPhoneNumber from "../utils/formatPhoneNumber";
import { addressSchema } from "../validations/addressSchema";
import * as yup from "yup";
import { toast } from "react-toastify";
import { dataShopSchema } from "../validations/dataShopSchema";
import { updateUserDataReq } from "../requests/profileRequests";
import { logOut } from "../utils/logout";
import { useGlobalContext } from "../context/globalContext";
import { useNavigate } from "react-router-dom";
import formatCPF from "../utils/formatCPF";
import isValidCpf from "../validations/validateCpf";
import { createCustomerAsaasReq } from "../requests/asaasRequests";

type UserDataRegisterProps = {
  setOpenUserDataRegister: React.Dispatch<React.SetStateAction<boolean>>;
  userDataResponse: {
    fullName?: string;
    birthDate?: string;
    phoneNumber?: string;
    cpf?: string;
    addressId?: string;
    address?: {
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
};

export default function UserDataRegister({
  setOpenUserDataRegister,
  userDataResponse,
}: UserDataRegisterProps) {
  const { profileId, token } = useGlobalContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    phoneNumber: "",
    cpf: "",
    addressId: userDataResponse.addressId || "",
  });

  const [address, setAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  // Carrega os dados de userData nos estados ao montar o componente
  useEffect(() => {
    if (userDataResponse) {
      setFormData({
        fullName: userDataResponse.fullName || "",
        birthDate: userDataResponse.birthDate || "",
        phoneNumber: userDataResponse.phoneNumber || "",
        cpf: userDataResponse.cpf || "",
        addressId: userDataResponse.addressId || "",
      });

      setAddress({
        street: userDataResponse.address?.street || "",
        number: userDataResponse.address?.number || "",
        complement: userDataResponse.address?.complement || "",
        neighborhood: userDataResponse.address?.neighborhood || "",
        city: userDataResponse.address?.city || "",
        state: userDataResponse.address?.state || "",
        postalCode: userDataResponse.address?.postalCode || "",
        country: userDataResponse.address?.country || "",
      });
    }
  }, [userDataResponse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const completeData = {
      ...formData,
      address,
    };

    try {
      await addressSchema.validate(address, { abortEarly: false });

      await dataShopSchema.validate(formData, { abortEarly: false });

      const validateCpf = isValidCpf(completeData.cpf);

      if (!validateCpf) {
        toast.error("CPF inválido");
        return;
      }

      if (!profileId || !token) {
        logOut(navigate);
        return;
      }

      const response = await createCustomerAsaasReq(
        profileId,
        token,
        completeData
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        await updateUserDataReq(profileId, completeData, token);
        
        toast.success("Dados cadastrados com sucesso!");
        setOpenUserDataRegister(false);        
        return;
      } else {
        toast.error(
          "Ops, deu ruim aqui :D, contate um administrador para averiguar a causa."
        );
        return;
      }

    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        console.error("Erros de validação:", validationError.errors);
        toast.info(validationError.errors[0]); // Exibe o primeiro erro
      }
    }
  };

  return (
    <div className="w-[90%] py-4 bg-white shadow-md rounded z-3 overflow-auto">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900">
              Dados para compra
            </h1>
            <button
              onClick={() => setOpenUserDataRegister(false)}
              className="font-bold text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-semibold mb-1"
              htmlFor="fullName"
            >
              Nome Completo
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Digite seu nome completo"
              required
            />
          </div>
          <div className="flex items-end w-full gap-4">
            <div className="w-1/2 mb-4">
              <label
                className="block text-gray-700 font-semibold text-sm mb-1"
                htmlFor="birthDate"
              >
                Data de nascimento
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <div className="w-1/2 mb-4">
              <label
                className="block text-gray-700 font-semibold mb-1"
                htmlFor="phoneNumber"
              >
                Telefone
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formatPhoneNumber(formData.phoneNumber)}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Digite seu telefone"
                required
              />
            </div>
          </div>
          <div className="w-1/2 mb-4">
            <label
              className="block text-gray-700 font-semibold mb-1"
              htmlFor="cpf"
            >
              CPF
            </label>
            <input
              type="cpf"
              id="cpf"
              name="cpf"
              value={formatCPF(formData.cpf)}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Digite seu CPF"
              required
            />
          </div>
          <div className="mb-4">
            <AddressForm address={address} setAddress={setAddress} />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 mt-4 rounded hover:bg-blue-600"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
