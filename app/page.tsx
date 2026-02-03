"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "./components/Header";
import PatientInfo from "./components/PatientInfo";
import ProcedureSelector from "./components/ProcedureSelector";
import ProcedureList from "./components/ProcedureList";
import { useProcedimentos, type Procedimento } from "./hooks/useProcedimentos";
import { validateForm } from "./schemas/formValidation";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Array<Procedimento & { count: number }>>([]);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const {
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
  } = useProcedimentos();

  useEffect(() => {
    setSearchTerm("");
    setIsOpen(false);
  }, [selectedPlano, selectedSubGrupo]);

  const totalSelectedCount = useMemo(
    () => selected.reduce((sum, item) => sum + item.count, 0),
    [selected]
  );

  // Validação do formulário
  const formValidation = useMemo(() => {
    const patientInfo = `${patientName}${animalType ? ` | ${animalType}` : ''}${patientAge ? ` | ${patientAge}` : ''}`;
    return validateForm(patientInfo, totalSelectedCount);
  }, [patientName, animalType, patientAge, totalSelectedCount]);

  // Usar useCallback para garantir que as funções não sejam recriadas a cada render
  const handleSelect = useCallback((procedure: Procedimento) => {
    setSelected((prevSelected) => {
      const existing = prevSelected.find((p) => p.cod === procedure.cod);
      if (existing) {
        return prevSelected.filter((p) => p.cod !== procedure.cod);
      }
      return [...prevSelected, { ...procedure, count: 1 }];
    });
  }, []);

  const handleRemove = useCallback((procedure: Procedimento & { count: number }) => {
    setSelected((prevSelected) =>
      prevSelected.filter((p) => p.cod !== procedure.cod)
    );
  }, []);

  const handleIncrement = useCallback((procedure: Procedimento & { count: number }) => {
    setSelected((prevSelected) =>
      prevSelected.map((p) =>
        p.cod === procedure.cod ? { ...p, count: p.count + 1 } : p
      )
    );
  }, []);

  const handleDecrement = useCallback((procedure: Procedimento & { count: number }) => {
    setSelected((prevSelected) =>
      prevSelected.map((p) =>
        p.cod === procedure.cod && p.count > 1
          ? { ...p, count: p.count - 1 }
          : p
      )
    );
  }, []);

  const generatePDF = async () => {
    if (isGeneratingPDF) return;

    // Validar formulário
    const patientInfo = `${patientName}${animalType ? ` | ${animalType}` : ''}${patientAge ? ` | ${patientAge}` : ''}`;
    const validation = validateForm(patientInfo, totalSelectedCount);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      const errorMessages = Object.values(validation.errors)
        .flat()
        .join("\n");
      alert(`Preencha os campos obrigatórios:\n\n${errorMessages}`);
      return;
    }

    setValidationErrors({});

    if (totalSelectedCount === 0) {
      alert("Selecione pelo menos um procedimento");
      return;
    }

    const element = document.getElementById("pdf-content");
    if (!element) return;

    setIsGeneratingPDF(true);

    // Gerar HTML puro para o PDF
    const proceduresHTML = selected
      .map(
        (procedure, index) => {
          const preco = procedure.preco && procedure.preco.trim() !== '' && procedure.preco.trim() !== 'R$ -' ? procedure.preco : 'R$ 0';
          return `
      <div style="display: flex; align-items: center; gap: 10px; padding: 12px; margin-bottom: 8px; background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px;">
        <div style="width: 20px; text-align: center; color: #000000; font-weight: bold; font-size: 12px; flex-shrink: 0;">${index + 1}</div>
        <p style="font-size: 14px; color: #000000; margin: 0; flex: 1;">${procedure.cod} - ${procedure.nome}</p>
        <span style="font-size: 14px; color: #000000;  margin-right: 8px;">${preco}</span>
        <span style="font-size: 14px; color: #000000;  white-space: nowrap;">Qtd: x${procedure.count}</span>
      </div>
    `
        }
      )
      .join("");

    const pdfHTML = `
    <div style="padding: 40px; background-color: #ffffff; font-family: Arial, sans-serif; width: 800px; margin: 0 auto; box-sizing: border-box;">
      <div style="margin-bottom: 30px; border-bottom: 2px solid #000000; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
          <img src="/logo.png" alt="VFP Hospital Veterinário" style="height: 60px; width: auto;" />
        </div>
        <h2 style="font-size: 24px; font-weight: bold; color: #000000; margin: 15px 0 20px 0;">Relatório de Procedimentos</h2>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db;">
          ${patientName ? `<p style="margin: 5px 0; font-size: 14px; color: #000000;"><strong>Paciente:</strong> ${patientName}</p>` : ""}
          ${animalType ? `<p style="margin: 5px 0; font-size: 14px; color: #000000;"><strong>Tipo:</strong> ${animalType}</p>` : ""}
          ${patientAge ? `<p style="margin: 5px 0; font-size: 14px; color: #000000;"><strong>Idade:</strong> ${patientAge}</p>` : ""}
          <p style="margin: 5px 0; font-size: 14px; color: #000000;"><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      <div>
        <h3 style="font-size: 18px; font-weight: bold; color: #000000; margin-bottom: 15px;">Procedimentos a Realizar (${totalSelectedCount})</h3>
        ${proceduresHTML}
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #000000; text-align: center;">
        <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">VFP Hospital Veterinário</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 5px 0;">Documento gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
      </div>
    </div>
    `;

    // Inserir HTML puro no elemento
    element.innerHTML = pdfHTML;
    
    // Deixar visível para html2canvas capturar corretamente
    element.style.display = "block";
    element.style.position = "fixed";
    element.style.left = "0";
    element.style.top = "0";
    element.style.width = "800px";
    element.style.zIndex = "-9999";

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      // Esconder novamente após capturar
      element.style.display = "none";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `procedimentos_${patientName || "paciente"}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Header />

      {/* Main Content */}
      <main className="mx-auto px-3 sm:px-6 py-6 sm:py-12 max-w-4xl">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: '#1B3D6D' }}>
            Agendamento de Procedimentos
          </h2>
          <p className="text-base sm:text-lg" style={{ color: '#00B050' }}>
            Selecione os procedimentos a serem realizados no animal
          </p>
        </div>

        {/* Cards Container */}
        <div className="flex flex-col gap-4 sm:gap-8">
          <PatientInfo
            patientName={patientName}
            animalType={animalType}
            patientAge={patientAge}
            onPatientNameChange={setPatientName}
            onAnimalTypeChange={setAnimalType}
            onPatientAgeChange={setPatientAge}
          />

          <ProcedureSelector
            isOpen={isOpen}
            searchTerm={searchTerm}
            selectedCount={selected.length}
            selected={selected}
            allProcedimentos={procedimentos}
            planos={planos}
            subGrupos={subGrupos}
            selectedPlano={selectedPlano}
            selectedSubGrupo={selectedSubGrupo}
            loadingPlanos={loadingPlanos}
            loadingSubGrupos={loadingSubGrupos}
            loadingProcedimentos={loadingProcedimentos}
            error={error}
            onToggleDropdown={() => setIsOpen(!isOpen)}
            onSearchChange={setSearchTerm}
            onPlanoChange={setSelectedPlano}
            onSubGrupoChange={setSelectedSubGrupo}
            onSelect={handleSelect}
          />

          <ProcedureList
            selected={selected}
            patientName={patientName}
            animalType={animalType}
            patientAge={patientAge}
            onRemove={handleRemove}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onGeneratePDF={generatePDF}
            isFormValid={formValidation.valid}
            validationErrors={validationErrors}
            isGeneratingPDF={isGeneratingPDF}
          />
        </div>
      </main>
    </div>
  );
}
