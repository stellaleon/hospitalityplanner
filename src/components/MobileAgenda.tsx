import { format, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { ChevronLeft, ChevronRight, BedDouble, User, CreditCard, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Room, Reservation } from '../types';

interface MobileAgendaProps {
  onReservationClick: (room: Room, date: Date, existingReservation?: Reservation) => void;
}

export function MobileAgenda({ onReservationClick }: MobileAgendaProps) {
  const { rooms, reservations, selectedDateStr, setSelectedDateStr } = useStore();
  const selectedDate = new Date(selectedDateStr);

  const prevDay = () => setSelectedDateStr(subDays(selectedDate, 1).toISOString().split('T')[0]);
  const nextDay = () => setSelectedDateStr(addDays(selectedDate, 1).toISOString().split('T')[0]);

  const getReservationForDay = (roomId: string) => {
    // A guest occupies the room for the night if date >= start and date < end
    return reservations.find(r => {
      if (r.roomId !== roomId) return false;
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      const checkDate = new Date(selectedDate);
      checkDate.setHours(0,0,0,0);
      return checkDate >= start && checkDate < end;
    });
  };

  return (
    <div className="flex-1 w-full bg-slate-50 md:hidden flex flex-col p-4 overflow-y-auto">
      {/* Day Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex items-center justify-between">
        <button onClick={prevDay} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold text-primary-600 uppercase tracking-widest">
            {format(selectedDate, 'EEEE', { locale: it })}
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {format(selectedDate, 'd MMMM yyyy', { locale: it })}
          </div>
        </div>
        <button onClick={nextDay} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Room Cards */}
      <div className="space-y-4 pb-20">
        {rooms.map(room => {
          const res = getReservationForDay(room.id);

          return (
            <div 
              key={room.id} 
              className={cn(
                "rounded-2xl border overflow-hidden shadow-sm transition-all duration-300",
                res ? "bg-white border-primary-200" : "bg-white border-slate-200"
              )}
            >
              <div className={cn(
                "px-5 py-4 border-b flex justify-between items-center",
                res ? "bg-primary-50 border-primary-100" : "bg-slate-50 border-slate-100"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", res ? "bg-primary-100 text-primary-700" : "bg-slate-200 text-slate-600")}>
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{room.name}</h3>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold shadow-sm",
                  res ? "bg-rose-100 text-rose-700 shadow-rose-200/50" : "bg-emerald-100 text-emerald-700 shadow-emerald-200/50"
                )}>
                  {res ? 'Occupata' : 'Libera'}
                </span>
              </div>

              <div className="p-5">
                {res ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{res.guestName}</p>
                        <p className="text-xs text-slate-500 mt-1">{res.bookingType} • {res.adultsChildren}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {format(new Date(res.startDate), 'dd MMM')} → {format(new Date(res.endDate), 'dd MMM')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div className="flex justify-between w-full items-center">
                        <div>
                          <p className="text-xs text-slate-500">Totale</p>
                          <p className="text-sm font-bold text-emerald-600">€{res.totalStay}</p>
                        </div>
                        <button 
                          onClick={() => onReservationClick(room, selectedDate, res)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                        >
                          Dettagli
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-slate-500 mb-4 text-sm">Nessuna prenotazione per questa data.</p>
                    <button 
                      onClick={() => onReservationClick(room, selectedDate)}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 font-semibold text-sm transition-transform active:scale-95"
                    >
                      Aggiungi Prenotazione
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
