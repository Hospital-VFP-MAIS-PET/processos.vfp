import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b-4" style={{ borderBottomColor: '#00B050' }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logo VFP */}
          <Image 
            src="/logo.png" 
            alt="VFP Hospital Veterinário" 
            width={200} 
            height={80}
            className="h-12 sm:h-16 w-auto"
            priority
          />
          
          <div className="ml-1 sm:ml-2 hidden sm:block">
            <p className="text-xs sm:text-sm font-medium" style={{ color: '#00B050' }}>Gestor de Procedimentos</p>
          </div>
        </div>
      </div>
    </header>
  );
}
