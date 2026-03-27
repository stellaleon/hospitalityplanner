import React from 'react';
import { useStore } from '../store/useStore';
import { getDaysInMonth, startOfMonth, format, addDays, isSameDay, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '../lib/utils';
import type { Reservation, Room } from '../types';

interface DesktopGridProps {
  onDayClick: (room: Room, date: Date, existingReservation?: Reservation) => void;
}

const ALL_ROWS = [
  { key: 'status', label: 'Stato camera' },
  { key: 'guestName', label: 'Nome prenotazione' },
  { key: 'bookingType', label: 'Tipo di prenotazione' },
  { key: 'contacts', label: 'Contatti' },
  { key: 'start', label: 'Data e ora arrivo' },
  { key: 'end', label: 'Data e ora partenza' },
  { key: 'adultsChildren', label: 'N° adulti e bamb.' },
  { key: 'touristTax', label: 'Tourist tax' },
  { key: 'breakfast', label: 'Colazione' },
  { key: 'specialRequests', label: 'Richieste particolari' },
  { key: 'pets', label: 'Animali' },
  { key: 'extraExpenses', label: 'Spese extra' },
  { key: 'pricePerNight', label: 'Costo per notte' },
  { key: 'deposit', label: 'Acconto' },
  { key: 'totalStay', label: 'Totale soggiorno' },
] as const;

export function DesktopGrid({ onDayClick }: DesktopGridProps) {
  const { rooms, reservations, currentMonthStr } = useStore();
  
  const baseDate = startOfMonth(new Date(currentMonthStr));
  const daysInMonth = getDaysInMonth(baseDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(baseDate, i));

  // Determine if a date is covered by a reservation (occupying the night)
  const getReservationForDay = (roomId: string, date: Date) => {
    return reservations.find(r => {
      if (r.roomId !== roomId) return false;
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      // It occupies the day if date is >= start AND date < end (night-based)
      return date >= start && date < end;
    });
  };

  const renderCellContent = (res: Reservation, rowKey: string) => {
    switch(rowKey) {
      case 'status':
        return (
          <div className="flex justify-center items-center py-1">
             <span className="px-3 py-1 bg-rose-100 text-rose-700 font-bold rounded-lg text-xs shadow-sm shadow-rose-200/50">
               Occupata
             </span>
          </div>
        );
      case 'guestName': return <div className="truncate px-2 font-medium">{res.guestName}</div>;
      case 'bookingType': 
        return (
          <div className="flex justify-center">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold">{res.bookingType || 'Booking'}</span>
          </div>
        );
      case 'contacts': return <div className="truncate px-2 text-xs text-slate-500">{res.contacts}</div>;
      case 'start': return <div className="text-center text-xs">{format(new Date(res.startDate), 'dd/MM/yyyy')}</div>;
      case 'end': return <div className="text-center text-xs">{format(new Date(res.endDate), 'dd/MM/yyyy')}</div>;
      case 'adultsChildren': return <div className="text-center">{res.adultsChildren}</div>;
      case 'touristTax': return <div className="text-center font-medium">€{res.touristTax}</div>;
      case 'breakfast': 
        return (
          <div className="flex justify-center">
             <span className={cn("px-2 py-0.5 rounded-md text-xs text-white", res.breakfast ? "bg-emerald-500" : "bg-rose-400")}>
                {res.breakfast ? 'Si' : 'No'}
             </span>
          </div>
        );
      case 'specialRequests': return <div className="truncate px-2 text-xs text-slate-500">{res.specialRequests}</div>;
      case 'pets': 
        return (
           <div className="flex justify-center">
             <span className={cn("px-2 py-0.5 rounded-md text-xs text-white", res.pets ? "bg-emerald-500" : "bg-rose-400")}>
                {res.pets ? 'Si' : 'No'}
             </span>
          </div>
        );
      case 'extraExpenses': return <div className="text-center font-medium">€{res.extraExpenses}</div>;
      case 'pricePerNight': return <div className="text-center font-medium">€{res.pricePerNight}</div>;
      case 'deposit': return <div className="text-center font-medium text-amber-600">€{res.deposit}</div>;
      case 'totalStay': return <div className="text-center font-bold text-emerald-600">€{res.totalStay}</div>;
      default: return null;
    }
  };

  return (
    <div className="flex-1 w-full overflow-hidden bg-white shadow-sm flex flex-col hidden md:flex">
      <div className="flex-1 overflow-auto border-t border-slate-200" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        <table className="w-full border-collapse min-w-max text-sm">
          <thead className="sticky top-0 z-20 bg-primary-600 outline outline-1 outline-primary-700">
            <tr>
              <th className="sticky left-0 z-30 bg-primary-600 text-white font-bold p-3 text-left w-48 shadow-[1px_0_0_#be185d]">
                CAMERE
              </th>
              {days.map((day, i) => (
                <th key={i} className="min-w-[120px] max-w-[150px] border-r border-primary-500 p-2 text-center text-white">
                  <div className="text-primary-100 font-medium text-xs uppercase tracking-wider">{format(day, 'E', { locale: it })}</div>
                  <div className="text-xl font-bold">{format(day, 'd')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rooms.map(room => (
              <React.Fragment key={room.id}>
                <tr className="bg-slate-50">
                  <td className="sticky left-0 z-10 bg-slate-50 font-bold text-primary-700 p-3 shadow-[1px_0_0_#e2e8f0]">
                    {room.name}
                  </td>
                  {days.map((day, i) => {
                    const res = getReservationForDay(room.id, day);
                    const isReserved = !!res;
                    // For the main row, we don't merge, we just show status or clickable Free slot
                    return (
                      <td key={i} className="border-r border-slate-200 p-1 text-center bg-white group hover:bg-slate-50 transition-colors">
                        {isReserved ? (
                          <div 
                            className="bg-primary-50 text-primary-700 font-bold px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-primary-100 border border-primary-200"
                            onClick={() => onDayClick(room, day, res)}
                          >
                            Occupata
                          </div>
                        ) : (
                          <div 
                            className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer border border-transparent hover:border-emerald-200 hover:bg-emerald-100 transition-colors w-full h-full flex items-center justify-center"
                            onClick={() => onDayClick(room, day)}
                          >
                            Libera
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {ALL_ROWS.slice(1).map(rowProp => (
                  <tr key={rowProp.key} className="hover:bg-slate-50/50 group">
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 text-slate-600 font-medium px-3 py-1.5 text-xs shadow-[1px_0_0_#e2e8f0]">
                      {rowProp.label}
                    </td>
                    {[...Array(daysInMonth)].map((_, i) => {
                      const currentDate = addDays(baseDate, i);
                      const res = getReservationForDay(room.id, currentDate);
                      
                      // Check if it's the START of the visual span in the current month
                      // It's the start if it's the first day of the reservation, OR it is the 1st of the month
                      if (res) {
                         const start = new Date(res.startDate);
                         const isVisualStart = isSameDay(currentDate, start) || (currentDate.getDate() === 1 && start <= currentDate);
                         
                         if (isVisualStart) {
                            const endOfRes = new Date(res.endDate);
                            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                            const actualEnd = endOfRes > endOfMonth ? addDays(endOfMonth, 1) : endOfRes; // Add 1 because we calculate night steps
                            
                            // Difference in days between visual start and actual end
                            let span = differenceInDays(actualEnd, currentDate);
                            if (span < 1) span = 1;

                            return (
                              <td 
                                key={i} 
                                colSpan={span} 
                                className="border-r border-slate-200 px-1 py-1.5 bg-primary-50/30"
                              >
                                <div 
                                  className="w-full h-full cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => onDayClick(room, currentDate, res)}
                                >
                                  {renderCellContent(res, rowProp.key)}
                                </div>
                              </td>
                            );
                         } else {
                            // Being rendered as part of a previous colspan
                            return null; // Do not render the cell
                         }
                      }

                      // Empty cell
                      return (
                        <td 
                          key={i} 
                          className="border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => onDayClick(room, currentDate)}
                        ></td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
