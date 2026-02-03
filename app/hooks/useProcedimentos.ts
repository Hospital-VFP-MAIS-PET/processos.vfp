import { useState, useEffect, useRef } from "react";

export interface Procedimento {
  cod: number;
  nome: string;
  planos: string;
  grupo_linha: string;
  sub_grupo: string;
  preco: string;
}

interface UseProcedimentosResponse {
  planos: string[];
  subGrupos: string[];
  procedimentos: Procedimento[];
  loadingPlanos: boolean;
  loadingSubGrupos: boolean;
  loadingProcedimentos: boolean;
  error: string | null;
  selectedPlano: string;
  selectedSubGrupo: string;
  setSelectedPlano: (value: string) => void;
  setSelectedSubGrupo: (value: string) => void;
  refetchPlanos: () => Promise<void>;
  refetchSubGrupos: () => Promise<void>;
  refetchProcedimentos: () => Promise<void>;
}

export function useProcedimentos(): UseProcedimentosResponse {
  const [planos, setPlanos] = useState<string[]>([]);
  const [subGrupos, setSubGrupos] = useState<string[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [selectedPlano, setSelectedPlano] = useState("");
  const [selectedSubGrupo, setSelectedSubGrupo] = useState("");
  const [loadingPlanos, setLoadingPlanos] = useState(true);
  const [loadingSubGrupos, setLoadingSubGrupos] = useState(false);
  const [loadingProcedimentos, setLoadingProcedimentos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const planosAbortRef = useRef<AbortController | null>(null);
  const subGruposAbortRef = useRef<AbortController | null>(null);
  const procedimentosAbortRef = useRef<AbortController | null>(null);

  const fetchPlanos = async () => {
    try {
      if (planosAbortRef.current) {
        planosAbortRef.current.abort();
      }

      planosAbortRef.current = new AbortController();
      setLoadingPlanos(true);
      setError(null);

      const response = await fetch("/api/procedimentos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: planosAbortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar planos: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setPlanos(data.data);
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar planos";
        setError(errorMessage);
        console.error("Erro:", errorMessage);
      }
    } finally {
      setLoadingPlanos(false);
    }
  };

  const fetchSubGrupos = async (plano: string) => {
    if (!plano) return;
    try {
      if (subGruposAbortRef.current) {
        subGruposAbortRef.current.abort();
      }

      subGruposAbortRef.current = new AbortController();
      setLoadingSubGrupos(true);
      setError(null);

      const response = await fetch(
        `/api/procedimentos?plano=${encodeURIComponent(plano)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: subGruposAbortRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ao buscar subgrupos: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setSubGrupos(data.data);
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar subgrupos";
        setError(errorMessage);
        console.error("Erro:", errorMessage);
      }
    } finally {
      setLoadingSubGrupos(false);
    }
  };

  const fetchProcedimentos = async (plano: string, subGrupo: string) => {
    if (!plano || !subGrupo) return;
    try {
      if (procedimentosAbortRef.current) {
        procedimentosAbortRef.current.abort();
      }

      procedimentosAbortRef.current = new AbortController();
      setLoadingProcedimentos(true);
      setError(null);

      const response = await fetch(
        `/api/procedimentos?plano=${encodeURIComponent(
          plano
        )}&sub_grupo=${encodeURIComponent(subGrupo)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: procedimentosAbortRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ao buscar procedimentos: ${response.statusText}`
        );
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
      setLoadingProcedimentos(false);
    }
  };

  useEffect(() => {
    fetchPlanos();

    return () => {
      if (planosAbortRef.current) {
        planosAbortRef.current.abort();
      }
      if (subGruposAbortRef.current) {
        subGruposAbortRef.current.abort();
      }
      if (procedimentosAbortRef.current) {
        procedimentosAbortRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    setSelectedSubGrupo("");
    setSubGrupos([]);
    setProcedimentos([]);

    if (selectedPlano) {
      fetchSubGrupos(selectedPlano);
    }
  }, [selectedPlano]);

  useEffect(() => {
    setProcedimentos([]);

    if (selectedPlano && selectedSubGrupo) {
      fetchProcedimentos(selectedPlano, selectedSubGrupo);
    }
  }, [selectedPlano, selectedSubGrupo]);

  return {
    planos,
    subGrupos,
    procedimentos,
    loadingPlanos,
    loadingSubGrupos,
    loadingProcedimentos,
    error,
    selectedPlano,
    selectedSubGrupo,
    setSelectedPlano,
    setSelectedSubGrupo,
    refetchPlanos: fetchPlanos,
    refetchSubGrupos: () => fetchSubGrupos(selectedPlano),
    refetchProcedimentos: () =>
      fetchProcedimentos(selectedPlano, selectedSubGrupo),
  };
}
