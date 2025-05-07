import { useEffect } from "react";
import viaCep from "../server/api.viacep";
import formatCep from "../utils/formatCEP";

interface AddressProps {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function AddressForm({
  address,
  setAddress,
}: {
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  setAddress: (address: AddressProps) => void;
}) {
  useEffect(() => {
    const fetchAddress = async () => {
      if (address.postalCode.replace(/\D/g, "").length === 8) {
        try {
          const response = await viaCep(address.postalCode.replace(/\D/g, ""));

          setAddress({
            ...address,
            street: response.publicPlace,
            neighborhood: response.neighborhood,
            city: response.locality,
            state: response.uf,
            country: "Brasil",
          });
        } catch (error) {
          console.error("Deu erro", error);
        }
      }
    };

    fetchAddress();
  }, [address.postalCode, setAddress]);

  const handleChangeCep = async (newCep: string) => {
    if (newCep.length === 0) {
      setAddress({
        ...address,
        postalCode: "",
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "Brasil",
      });
    } else if (newCep.length <= 9) {
      setAddress({
        ...address,
        postalCode: formatCep(newCep),
      });
    }
  };

  const handleChangeNumber = (newNumber: string) => {
    setAddress({
      ...address,
      number: newNumber.replace(/\D/g, ""),
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Endereço</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex justify-between gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              CEP
            </label>
            <input
              type="text"
              value={address.postalCode}
              onChange={(e) => handleChangeCep(e.target.value)}
              className="w-28 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
              maxLength={9}
              placeholder="00000-000"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              País
            </label>
            <input
              type="text"
              value={address.country}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
        </div>
        <div className="flex gap-4 w-full">
          <div className="w-1/2">
            <label className="block text-gray-700 font-semibold mb-1">
              Cidade
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-700 font-semibold mb-1">
              Estado
            </label>
            <input
              type="text"
              value={address.state}
              onChange={(e) =>
                setAddress({ ...address, state: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Bairro
          </label>
          <input
            type="text"
            value={address.neighborhood}
            onChange={(e) =>
              setAddress({ ...address, neighborhood: e.target.value })
            }
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>
        <div className="flex gap-4 w-full">
          <div className="w-4/5">
            <label className="block text-gray-700 font-semibold mb-1">
              Rua
            </label>
            <input
              type="text"
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div className="w-1/5">
            <label className="block text-gray-700 font-semibold mb-1">
              Número
            </label>
            <input
              type="text"
              value={address.number}
              onChange={(e) => handleChangeNumber(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Complemento
          </label>
          <input
            type="text"
            value={address.complement}
            onChange={(e) =>
              setAddress({ ...address, complement: e.target.value })
            }
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>
    </div>
  );
}
