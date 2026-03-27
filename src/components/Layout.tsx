import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useStore } from '../store/useStore';
import { format, addMonths, subMonths, isSameMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { Download, Upload, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';


export function Layout({ children }: { children: ReactNode }) {
  const { currentMonthStr, setCurrentMonthStr, reservations, importData } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMonth = new Date(currentMonthStr);

  const handlePrevMonth = () => setCurrentMonthStr(subMonths(currentMonth, 1).toISOString());
  const handleNextMonth = () => setCurrentMonthStr(addMonths(currentMonth, 1).toISOString());

  const handleExport = () => {
    const data = JSON.stringify(useStore.getState());
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospitality-planner-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) importData(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Calcolo Totale Mensile: tutte le prenotazioni che toccano il mese corrente
  const monthlyTotal = reservations.reduce((sum, res) => {
    const start = new Date(res.startDate);
    const end = new Date(res.endDate);
    if (isSameMonth(start, currentMonth) || isSameMonth(end, currentMonth) || (start < currentMonth && end > currentMonth)) {
      return sum + (Number(res.totalStay) || 0);
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg text-white">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                Hospitality Planner
              </h1>
            </div>

            <div className="hidden md:flex items-center flex-1 justify-center max-w-md mx-6">
              <div className="flex items-center gap-4 bg-slate-100 rounded-full p-1.5 shadow-sm border border-slate-200/60">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-full transition-colors text-slate-600">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold w-32 text-center capitalize text-slate-700">
                  {format(currentMonth, 'MMMM yyyy', { locale: it })}
                </h2>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-full transition-colors text-slate-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Totale Mensile</span>
                <span className="text-lg font-bold text-emerald-600">€{monthlyTotal.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleExport}
                className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Esporta Dati"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Importa Dati"
              >
                <Upload className="w-5 h-5" />
              </button>
              <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleImport} />
            </div>
          </div>
          
          <div className="md:hidden flex items-center justify-between py-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-1 text-slate-600">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-semibold w-28 text-center capitalize text-slate-700">
                  {format(currentMonth, 'MMM yyyy', { locale: it })}
                </h2>
                <button onClick={handleNextMonth} className="p-1 text-slate-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Totale Mensile</span>
                <span className="text-sm font-bold text-emerald-600">€{monthlyTotal.toFixed(2)}</span>
              </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-full overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
