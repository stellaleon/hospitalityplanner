import React from 'react';
import { useStore } from '../store/useStore';
import { getDaysInMonth, startOfMonth, format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn, parseDateLocal } from '../lib/utils';
import type { Reservation, Room } from '../types';
import { Edit2 } from 'lucide-react';

interface DesktopGridProps {
  onDayClick: (room: Room, date: Date, existingReservation?: Reservation) => void;
}

const ALL_ROWS = [
  { key: 'guestName', label: 'Nome prenotazione' },
  { key: 'bookingType', label: 'Tipo di prenotazione' },
  { key: 'phone', label: 'Telefono' },
  { key: 'email', label: 'Email' },
  { key: 'start', label: 'Data e ora arrivo' },
  { key: 'end', label: 'Data e ora partenza' },
  { key: 'adults', label: 'N° adulti e bamb.' },
  { key: 'touristTax', label: 'Tourist tax' },
  { key: 'servizio', label: 'Servizio (Colazione)' },
  { key: 'specialRequests', label: 'Richieste particolari' },
  { key: 'pets', label: 'Animali' },
  { key: 'extraExpenses', label: 'Spese extra' },
  { key: 'pricePerNight', label: 'Costo per notte' },
  { key: 'deposit', label: 'Acconto' },
  { key: 'totalStay', label: 'Totale soggiorno' },
] as const;

export function DesktopGrid({ onDayClick }: DesktopGridProps) {
  const { rooms, reservations, currentMonthStr, updateRoom, roomStatuses, setRoomStatus } = useStore();
  
  const baseDate = startOfMonth(new Date(currentMonthStr));
  const daysInMonth = getDaysInMonth(baseDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(baseDate, i));

  const getReservationHalfDayInterval = (res: Reservation) => {
    const start = parseDateLocal(res.startDate);
    const end = parseDateLocal(res.endDate);
    const monthStart = baseDate;
    const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth(), daysInMonth);
    
    let startIndex = -1;
    if (start < monthStart) startIndex = 0;
    else if (start > monthEnd) return null;
    else startIndex = (start.getDate() - 1) * 2 + 1;

    let endIndex = -1;
    if (end > monthEnd) endIndex = daysInMonth * 2 - 1;
    else if (end < monthStart) return null;
    else endIndex = (end.getDate() - 1) * 2;

    if (endIndex < startIndex) endIndex = startIndex;
    return { startIndex, endIndex, colSpan: endIndex - startIndex + 1 };
  };

  const renderCellContent = (res: Reservation, rowKey: string) => {
    switch(rowKey) {
      case 'guestName': return <div className="truncate px-2 font-medium text-center">{res.guestName}</div>;
      case 'bookingType': 
        return (
          <div className="flex justify-center">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold">{res.bookingType || 'Booking'}</span>
          </div>
        );
      case 'phone': return <div className="truncate px-2 text-xs text-slate-500 text-center">{res.phone}</div>;
      case 'email': return <div className="truncate px-2 text-xs text-slate-500 text-center">{res.email}</div>;
      case 'start': return <div className="text-center text-xs">{format(parseDateLocal(res.startDate), 'dd/MM/yyyy')} {res.checkInTime}</div>;
      case 'end': return <div className="text-center text-xs">{format(parseDateLocal(res.endDate), 'dd/MM/yyyy')} {res.checkOutTime}</div>;
      case 'adults': return <div className="text-center">{res.adults}A {res.children}B</div>;
      case 'touristTax': return <div className="text-center font-medium">€{res.touristTax}</div>;
      case 'servizio':  
        return (
          <div className="flex justify-center">
             <span className={cn("px-2 py-0.5 rounded-md text-xs text-white", res.breakfast ? "bg-emerald-500" : "bg-rose-400")}>
                {res.breakfast ? 'Si' : 'No'}
             </span>
          </div>
        );
      case 'specialRequests': return <div className="truncate px-2 text-xs text-slate-500 text-center">{res.specialRequests}</div>;
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
                <th key={i} colSpan={2} className="min-w-[120px] max-w-[150px] border-r border-primary-500 p-2 text-center text-white">
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
                    <div className="flex items-center gap-2">
                       {room.name}
                       <button onClick={() => {
                         const newName = prompt("Nuovo nome della camera:", room.name);
                         if (newName && newName.trim()) updateRoom(room.id, newName.trim());
                       }} className="text-slate-400 hover:text-primary-600">
                         <Edit2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                  {days.map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const statusKey = `${room.id}-${dateStr}`;
                    const customStatus = roomStatuses[statusKey];
                    const isReserved = !!reservations.find(r => {
                       if (r.roomId !== room.id) return false;
                       const s = parseDateLocal(r.startDate);
                       const e = parseDateLocal(r.endDate);
                       return day >= s && day <= e;
                    });
                    
                    const actualStatus = customStatus || (isReserved ? 'Occupata' : 'Libera');

                    return (
                      <td key={i} colSpan={2} className="border-r border-slate-200 p-1 text-center bg-white group hover:bg-slate-50 transition-colors">
                         <select 
                           value={actualStatus}
                           onChange={(e) => setRoomStatus(room.id, dateStr, e.target.value as any)}
                           className={cn(
                             "w-full h-full text-center text-xs font-bold rounded cursor-pointer outline-none appearance-none px-2 py-1.5 border hover:opacity-80 transition-colors",
                             actualStatus === 'Occupata' && "bg-primary-50 text-primary-700 border-primary-200",
                             actualStatus === 'Libera' && "bg-emerald-50 text-emerald-700 border-transparent hover:border-emerald-200",
                             actualStatus === 'Prenotata' && "bg-blue-50 text-blue-700 border-blue-200",
                             actualStatus === 'Da pulire' && "bg-amber-50 text-amber-700 border-amber-200"
                           )}
                         >
                           <option value="Libera">Libera</option>
                           <option value="Occupata">Occupata</option>
                           <option value="Prenotata">Prenotata</option>
                           <option value="Da pulire">Da pulire</option>
                         </select>
                      </td>
                    );
                  })}
                </tr>

                {ALL_ROWS.map(rowProp => {
                   const roomReservations = reservations.map(r => ({
                      res: r,
                      interval: r.roomId === room.id ? getReservationHalfDayInterval(r) : null
                   })).filter(x => x.interval !== null);

                   return (
                     <tr key={rowProp.key} className="hover:bg-slate-50/50 group">
                       <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 text-slate-600 font-medium px-3 py-1.5 text-xs shadow-[1px_0_0_#e2e8f0]">
                         {rowProp.label}
                       </td>
                       {[...Array(daysInMonth * 2)].map((_, halfIndex) => {
                          const startingHere = roomReservations.find(x => x.interval!.startIndex === halfIndex);
                          
                          if (startingHere) {
                             const { res, interval } = startingHere;
                             const currentDate = addDays(baseDate, Math.floor(interval!.startIndex / 2));
                             return (
                               <td 
                                 key={halfIndex} 
                                 colSpan={interval!.colSpan} 
                                 className="border border-slate-200 px-1 py-1.5 bg-primary-50/40 relative min-w-[60px]"
                               >
                                 <div 
                                   className="w-full h-full cursor-pointer hover:opacity-80 transition-opacity absolute inset-0 pt-1.5 pl-1.5 z-0"
                                   onClick={() => onDayClick(room, currentDate, res)}
                                 />
                                 <div className="relative z-10 pointer-events-none">{renderCellContent(res, rowProp.key)}</div>
                               </td>
                             );
                          }
                          
                          const coveredBy = roomReservations.find(x => halfIndex > x.interval!.startIndex && halfIndex <= x.interval!.endIndex);
                          
                          if (coveredBy) {
                             return null;
                          }

                          const currentDate = addDays(baseDate, Math.floor(halfIndex / 2));
                          return (
                            <td 
                              key={halfIndex} 
                              className={cn("border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors min-w-[60px]", halfIndex % 2 === 1 ? "border-r border-r-slate-200" : "border-r border-r-slate-100 border-dashed")}
                              onClick={() => onDayClick(room, currentDate)}
                            ></td>
                          );
                       })}
                     </tr>
                   )
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
