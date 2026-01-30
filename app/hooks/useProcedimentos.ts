import { useState, useEffect, useRef } from "react";

export interface Procedimento {
  cod: number;
  nome: string;
  grupo_linha: string;
  sub_grupo: string;
  preco_tabela: string;
}

interface UseProcedimentosResponse {
  procedimentos: Procedimento[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProcedimentos(): UseProcedimentosResponse {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProcedimentos = async () => {
    try {
      // Cancelar requisição anterior se houver
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      const response = await fetch("/api/procedimentos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "force-cache", // Usa cache agressivamente
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar procedimentos: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setProcedimentos(data.data);
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro ao buscar procedimentos";
        setError(errorMessage);
        console.error("Erro:", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedimentos();

    return () => {
      // Limpar requisição ao desmontar
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    procedimentos,
    loading,
    error,
    refetch: fetchProcedimentos,
  };
}
