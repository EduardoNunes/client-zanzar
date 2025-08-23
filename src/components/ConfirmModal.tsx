import { useGlobalContext } from "../context/globalContext";

export default function ConfirmModal({ onConfirm, text, text2 }: any) {
  const { setIsOpen } = useGlobalContext();

  function confirm() {
    onConfirm();
    setIsOpen(false);
  }

  function handleCancel() {
    setIsOpen(false);
  }

  return (
    <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full z-4 p-8"
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col p-8">
        <h1 className="font-inter font-semibold text-[18px] text-gray-900 mb-4 text-center">
          {text}
        </h1>
        {text2 && (
          <p className="text-gray-700 mb-6 text-center">{text2}</p>
        )}
        <div className="flex w-full gap-4 mt-2">
          <button
            className="flex-1 h-10 font-nunito font-bold text-lg text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
            onClick={confirm}
          >
            Sim
          </button>
          <button
            className="flex-1 h-10 font-nunito font-bold text-lg text-white rounded-lg bg-gray-400 hover:bg-gray-500 transition-colors"
            onClick={handleCancel}
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
}
