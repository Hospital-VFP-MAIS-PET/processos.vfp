import { ChevronDown, Search } from "lucide-react";
import { useMemo, memo, useCallback, useEffect, useState, useRef, useDeferredValue } from "react";
import { useDebounce } from "@/app/hooks/useDebounce";
import { List } from "react-window";
import ProcedureItem from "./ProcedureItem";

export interface Procedimento {
  cod: number;
  nome: string;
  grupo_linha: string;
  sub_grupo: string;
  preco_tabela: string;
}

interface ProcedureSelectorProps {
  isOpen: boolean;
  searchTerm: string;
  selectedCount: number;
  selected: Procedimento[];
  allProcedimentos: Procedimento[];
  loading: boolean;
  error: string | null;
  onToggleDropdown: () => void;
  onSearchChange: (term: string) => void;
  onSelect: (procedure: Procedimento) => void;
}

const ProcedureSelector = memo(function ProcedureSelector({
  isOpen,
  searchTerm,
  selectedCount,
  selected,
  allProcedimentos,
  loading,
  error,
  onToggleDropdown,
  onSearchChange,
  onSelect,
}: ProcedureSelectorProps) {
  // Debounce a busca para evitar re-renderizações frequentes
  const debouncedSearchTerm = useDebounce(searchTerm, 150);

  // Detectar se está em mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filtrar com o termo debouncizado
  const debouncedFiltered = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return allProcedimentos;
    return allProcedimentos.filter((proc) =>
      proc.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, allProcedimentos]);

  // Lista adiada: React não bloqueia a UI ao abrir o dropdown
  const deferredFiltered = useDeferredValue(debouncedFiltered);

  // Só montar a lista virtualizada depois do dropdown estar visível (evita travamento)
  const [listReady, setListReady] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [listWidth, setListWidth] = useState(400);

  useEffect(() => {
    if (!isOpen) {
      setListReady(false);
      return;
    }
    // Dar tempo para o dropdown e o campo de busca renderizarem primeiro
    const t1 = requestAnimationFrame(() => {
      const t2 = requestAnimationFrame(() => {
        setListReady(true);
      });
      return () => cancelAnimationFrame(t2);
    });
    return () => cancelAnimationFrame(t1);
  }, [isOpen]);

  // Medir largura do container para o List (evita layout thrashing com width="100%")
  useEffect(() => {
    if (!listReady || !listContainerRef.current) return;
    const el = listContainerRef.current;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === "number" && w > 0) setListWidth(w);
    });
    observer.observe(el);
    setListWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, [listReady]);

  // Memoizar os selecionados para comparação rápida
  const selectedCods = useMemo(
    () => new Set(selected.map((p) => p.cod)),
    [selected]
  );

  // Props estáveis para a lista (API react-window 2.x)
  const listRowProps = useMemo(
    () => ({
      items: deferredFiltered,
      selectedCods,
      onSelect,
    }),
    [deferredFiltered, selectedCods, onSelect]
  );

  // Componente de linha para a lista virtualizada (API react-window 2.x)
  const RowComponent = useCallback(
    ({
      index,
      style,
      items,
      selectedCods: cods,
      onSelect: onSelectItem,
    }: {
      index: number;
      style: React.CSSProperties;
      items: Procedimento[];
      selectedCods: Set<number>;
      onSelect: (p: Procedimento) => void;
    }) => {
      const procedure = items[index];
      return (
        <div style={{...style, cursor: 'pointer'}} className="cursor-pointer">
          <ProcedureItem
            procedure={procedure}
            isSelected={cods.has(procedure.cod)}
            onSelect={onSelectItem}
          />
        </div>
      );
    },
    []
  );

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-4">
          Selecione os Procedimentos
        </label>
        <div className="relative">
          <button
            onClick={onToggleDropdown}
            disabled={loading}
            className="w-full flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-gray-200 rounded-xl px-5 py-4 hover:border-blue-400 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-gray-700 font-medium">
              {loading
                ? "Carregando..."
                : selectedCount > 0
                ? `${selectedCount} procedimento${selectedCount !== 1 ? "s" : ""} selecionado${selectedCount !== 1 ? "s" : ""}`
                : "Selecionar procedimentos..."}
            </span>
            <ChevronDown
              size={20}
              className={`text-gray-600 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && !loading && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 rounded-xl shadow-xl z-10 overflow-hidden" style={{ borderColor: '#00B050' }}>
              {/* Campo de Busca */}
              <div className="p-4 border-b border-gray-100 sticky top-0 z-20" style={{ backgroundColor: '#f0fdf4' }}>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#00B050' }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar procedimento..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-black"
                    style={{ borderColor: '#00B050' }}
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 176, 80, 0.2)'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = ''}
                    autoFocus
                  />
                </div>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div className="px-5 py-3 bg-red-50 border-b border-red-200 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Lista de Procedimentos - montagem adiada + virtualizada */}
              {!listReady ? (
                <div
                  ref={listContainerRef}
                  className="h-96 sm:h-[384px] flex items-center justify-center text-gray-400 text-xs sm:text-sm"
                >
                  Carregando lista...
                </div>
              ) : deferredFiltered.length > 0 ? (
                <div ref={listContainerRef} className="overflow-hidden">
                  <List<typeof listRowProps>
                    rowComponent={RowComponent}
                    rowCount={deferredFiltered.length}
                    rowHeight={isMobile ? 75 : 52}
                    rowProps={listRowProps}
                    style={{ height: isMobile ? 300 : 384, width: listWidth }}
                  />
                </div>
              ) : (
                <div className="px-4 sm:px-5 py-8 text-gray-500 text-center text-xs sm:text-sm h-96 flex items-center justify-center">
                  {debouncedSearchTerm
                    ? "Nenhum procedimento encontrado"
                    : "Nenhum procedimento disponível"}
                </div>
              )}
            </div>
          )}

          {loading && isOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-blue-200 rounded-xl shadow-xl z-10 p-4 text-center text-gray-500">
              Carregando procedimentos...
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProcedureSelector;
