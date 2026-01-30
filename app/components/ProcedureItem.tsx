import { memo } from "react";

export interface Procedimento {
  cod: number;
  nome: string;
  grupo_linha: string;
  sub_grupo: string;
  preco_tabela: string;
}

interface ProcedureItemProps {
  procedure: Procedimento;
  isSelected: boolean;
  onSelect: (procedure: Procedimento) => void;
}

const ProcedureItem = memo(
  function ProcedureItem({
    procedure,
    isSelected,
    onSelect,
  }: ProcedureItemProps) {
    const handleClick = () => onSelect(procedure);

    return (
      <button
        onClick={handleClick}
        className={`w-full text-left px-5 py-3 flex items-center gap-3 border-b border-gray-50 transition-all duration-150 ${
          isSelected
            ? "bg-blue-50 border-l-4 border-l-blue-600"
            : "hover:bg-gray-50"
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          readOnly
          className="w-5 h-5 text-blue-600 rounded cursor-pointer accent-blue-600 flex-shrink-0"
        />
        <span
          className={`${
            isSelected ? "font-semibold text-gray-900" : "text-gray-700"
          }`}
        >
          {procedure.nome}
        </span>
      </button>
    );
  },
  (prevProps, nextProps) => {
    // Comparação customizada: retorna true se as props não mudaram
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.procedure.cod === nextProps.procedure.cod
    );
  }
);

export default ProcedureItem;
