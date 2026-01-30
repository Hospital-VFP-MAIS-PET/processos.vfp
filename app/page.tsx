"use client";

import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "./components/Header";
import PatientInfo from "./components/PatientInfo";
import ProcedureSelector from "./components/ProcedureSelector";
import ProcedureList from "./components/ProcedureList";
import { useProcedimentos, type Procedimento } from "./hooks/useProcedimentos";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Procedimento[]>([]);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [animalType, setAnimalType] = useState("");

  const { procedimentos, loading, error } = useProcedimentos();

  // Usar useCallback para garantir que as funções não sejam recriadas a cada render
  const handleSelect = useCallback((procedure: Procedimento) => {
    setSelected((prevSelected) => {
      const isSelected = prevSelected.some((p) => p.cod === procedure.cod);
      if (isSelected) {
        return prevSelected.filter((p) => p.cod !== procedure.cod);
      } else {
        return [...prevSelected, procedure];
      }
    });
  }, []);

  const handleRemove = useCallback((procedure: Procedimento) => {
    setSelected((prevSelected) =>
      prevSelected.filter((p) => p.cod !== procedure.cod)
    );
  }, []);

  const generatePDF = async () => {
    if (selected.length === 0) {
      alert("Selecione pelo menos um procedimento");
      return;
    }

    const element = document.getElementById("pdf-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

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
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Agendamento de Procedimentos
          </h2>
          <p className="text-lg text-gray-600">
            Selecione os procedimentos a serem realizados no animal
          </p>
        </div>

        {/* Cards Container */}
        <div className="flex flex-col gap-8">
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
            loading={loading}
            error={error}
            onToggleDropdown={() => setIsOpen(!isOpen)}
            onSearchChange={setSearchTerm}
            onSelect={handleSelect}
          />

          <ProcedureList
            selected={selected}
            patientName={patientName}
            animalType={animalType}
            patientAge={patientAge}
            onRemove={handleRemove}
            onGeneratePDF={generatePDF}
          />
        </div>
      </main>
    </div>
  );
}
