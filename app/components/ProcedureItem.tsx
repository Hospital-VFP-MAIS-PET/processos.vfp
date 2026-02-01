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
        className="w-full text-left px-2 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border-b border-gray-50 transition-all duration-150 cursor-pointer"
        style={{
          backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
          borderLeftWidth: isSelected ? '4px' : '0',
          borderLeftColor: isSelected ? '#00B050' : 'transparent',
          minHeight: '60px',
          alignItems: 'flex-start',
          paddingTop: '8px',
          paddingBottom: '8px',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          readOnly
          className="w-5 h-5 rounded cursor-pointer flex-shrink-0"
          style={{ accentColor: '#00B050' }}
        />
        <span
          className={`${isSelected ? "font-semibold" : ""} text-xs sm:text-sm break-words overflow-wrap`}
          style={{ color: isSelected ? '#1B3D6D' : '#374151', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
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
