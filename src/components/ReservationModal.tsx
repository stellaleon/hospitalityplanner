import { useState, useEffect } from 'react';
import type { Reservation, Room } from '../types';
import { useStore } from '../store/useStore';
import { X, Save, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ReservationModalProps {
  room: Room;
  initialDate: Date;
  existingReservation?: Reservation;
  onClose: () => void;
}

export function ReservationModal({ room, initialDate, existingReservation, onClose }: ReservationModalProps) {
  const { addReservation, updateReservation, deleteReservation } = useStore();
  
  const [formData, setFormData] = useState<Omit<Reservation, 'id' | 'roomId'>>({
    startDate: existingReservation?.startDate || format(initialDate, 'yyyy-MM-dd'),
    endDate: existingReservation?.endDate || format(new Date(initialDate.getTime() + 86400000), 'yyyy-MM-dd'),
    checkInTime: existingReservation?.checkInTime || '',
    checkOutTime: existingReservation?.checkOutTime || '',
    guestName: existingReservation?.guestName || '',
    bookingType: existingReservation?.bookingType || 'Booking',
    email: existingReservation?.email || '',
    phone: existingReservation?.phone || '',
    adults: existingReservation?.adults || 2,
    children: existingReservation?.children || 0,
    touristTax: existingReservation?.touristTax || 0,
    breakfast: existingReservation?.breakfast || false,
    specialRequests: existingReservation?.specialRequests || '',
    pets: existingReservation?.pets || false,
    extraExpenses: existingReservation?.extraExpenses || 0,
    pricePerNight: existingReservation?.pricePerNight || 0,
    deposit: existingReservation?.deposit || 0,
    totalStay: existingReservation?.totalStay || 0,
  });

  // Ricalcolo totale
  useEffect(() => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const nights = differenceInDays(end, start);
    
    if (nights > 0 && formData.pricePerNight >= 0) {
      const baseTotal = nights * Number(formData.pricePerNight);
      const withExtras = baseTotal + Number(formData.extraExpenses) + Number(formData.touristTax);
      setFormData(prev => ({ ...prev, totalStay: withExtras }));
    }
  }, [formData.startDate, formData.endDate, formData.pricePerNight, formData.extraExpenses, formData.touristTax]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    // @ts-ignore
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSave = () => {
    if (!formData.guestName || !formData.startDate || !formData.endDate) {
      alert("Compila almeno i campi obbligatori (Nome e Date).");
      return;
    }
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end <= start) {
      alert("La data di checkout deve essere successiva al checkin.");
      return;
    }

    if (existingReservation) {
      updateReservation(existingReservation.id, formData);
    } else {
      addReservation({
        ...formData,
        roomId: room.id
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingReservation && confirm("Vuoi davvero eliminare questa prenotazione?")) {
      deleteReservation(existingReservation.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {existingReservation ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}
            </h2>
            <p className="text-sm font-semibold text-primary-600 mt-1">{room.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Ospite *</label>
              <input 
                type="text" 
                name="guestName" 
                value={formData.guestName} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                placeholder="es. Mario Rossi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo Prenotazione</label>
              <select 
                name="bookingType" 
                value={formData.bookingType} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
              >
                <option value="Booking">Booking</option>
                <option value="Airbnb">Airbnb</option>
                <option value="Diretto">Diretto</option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Check-in *</label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Check-out *</label>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                  placeholder="es. mario@email.com"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefono</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                  placeholder="es. +39 333..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">N° Adulti</label>
                <input 
                  type="number" min="1"
                  name="adults" 
                  value={formData.adults} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">N° Bambini</label>
                <input 
                  type="number" min="0"
                  name="children" 
                  value={formData.children} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Orario Check-in</label>
                <input 
                  type="time" 
                  name="checkInTime" 
                  value={formData.checkInTime} 
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Orario Check-out</label>
                <input 
                  type="time" 
                  name="checkOutTime" 
                  value={formData.checkOutTime} 
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Servizio</label>
              <div className="flex gap-4 mt-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" name="breakfast" checked={formData.breakfast} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500" />
                  Colazione
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" name="pets" checked={formData.pets} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500" />
                  Animali
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Note e Richieste</label>
              <textarea 
                name="specialRequests" 
                value={formData.specialRequests} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm h-20 resize-none"
                placeholder="Dettagli extra, arrivo ritardato, ecc."
              ></textarea>
            </div>
            
            <div className="md:col-span-2 pt-4 pb-2 border-t border-slate-100">
              <h3 className="text-sm font-bold tracking-wide text-slate-400 uppercase mb-4">Costi</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Costo/Notte €</label>
                  <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary-500 text-sm font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Spese Extra €</label>
                  <input type="number" name="extraExpenses" value={formData.extraExpenses} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary-500 text-sm font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tassa Sogg. €</label>
                  <input type="number" name="touristTax" value={formData.touristTax} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary-500 text-sm font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Acconto €</label>
                  <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-amber-500 text-amber-700 text-sm font-semibold" />
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center rounded-b-2xl">
          <div className="flex flex-col">
             <span className="text-xs font-bold text-slate-400 uppercase">Totale Soggiorno</span>
             <span className="text-2xl font-black text-emerald-600">€{formData.totalStay.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {existingReservation && (
              <button 
                onClick={handleDelete}
                className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors shrink-0"
                title="Elimina"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-600/30 transition-transform active:scale-95"
            >
              <Save className="w-5 h-5" />
              <span>Salva</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
